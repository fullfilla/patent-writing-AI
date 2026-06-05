import json
import posixpath
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path
from xml.etree import ElementTree as ET

PUNCTUATION_SUFFIXES = (")", "）", ".", "。", ":", "：")


def local_name(tag):
    return tag.split("}", 1)[-1] if isinstance(tag, str) else ""


def stringify(value):
    return "" if value is None else str(value)


def get_attr_by_local_name(element, name, default=""):
    if element is None:
        return default
    for attr_name, value in element.attrib.items():
        if local_name(attr_name) == name:
            return value
    return default


def find_child(element, name):
    if element is None:
        return None
    for child in list(element):
        if local_name(child.tag) == name:
            return child
    return None


def find_children(element, name):
    if element is None:
        return []
    return [child for child in list(element) if local_name(child.tag) == name]


def find_descendants(element, name):
    if element is None:
        return []
    return [node for node in element.iter() if local_name(node.tag) == name]


def find_first_descendant(element, name):
    if element is None:
        return None
    for node in element.iter():
        if local_name(node.tag) == name:
            return node
    return None


def normalize_part_path(path_value):
    normalized = posixpath.normpath(stringify(path_value).replace("\\", "/")).lstrip("/")
    return "" if normalized == "." else normalized


def resolve_target_path(base_part, target):
    target_value = stringify(target).strip()
    if not target_value:
        return ""
    if target_value.startswith("/"):
        return normalize_part_path(target_value)

    base_dir = posixpath.dirname(base_part) if base_part else ""
    return normalize_part_path(posixpath.join(base_dir, target_value))


def get_relationships_member(part_path):
    normalized = normalize_part_path(part_path)
    if not normalized:
        return "_rels/.rels"

    base_dir = posixpath.dirname(normalized)
    file_name = posixpath.basename(normalized)
    rels_name = f"{file_name}.rels"
    if base_dir:
        return f"{base_dir}/_rels/{rels_name}"
    return f"_rels/{rels_name}"


def read_xml_from_zip(docx, member):
    try:
        raw = docx.read(member)
    except KeyError:
        return None

    try:
        return ET.fromstring(raw)
    except ET.ParseError as exc:
        raise ValueError(f"无法解析 {member}，文件结构可能已损坏。") from exc


def find_related_part(docx, source_part, rel_type_suffix):
    rels_member = get_relationships_member(source_part)
    rels_root = read_xml_from_zip(docx, rels_member)
    if rels_root is None:
        return ""

    for rel in find_children(rels_root, "Relationship"):
        rel_type = stringify(rel.get("Type")).strip()
        if rel_type.endswith(rel_type_suffix):
            return resolve_target_path(source_part, rel.get("Target", ""))
    return ""


def find_main_document_part(docx):
    main_part = find_related_part(docx, "", "/officeDocument")
    if main_part:
        return main_part

    content_types_root = read_xml_from_zip(docx, "[Content_Types].xml")
    if content_types_root is not None:
        for override in find_children(content_types_root, "Override"):
            content_type = stringify(override.get("ContentType")).strip()
            if "wordprocessingml.document.main+xml" in content_type:
                return normalize_part_path(override.get("PartName", ""))

    for member in docx.namelist():
        normalized = normalize_part_path(member)
        if normalized.endswith("/document.xml") or normalized == "word/document.xml":
            return normalized
    return ""


def build_numbering_maps(docx, document_part):
    numbering_part = find_related_part(docx, document_part, "/numbering")
    if not numbering_part:
        for member in docx.namelist():
            normalized = normalize_part_path(member)
            if normalized.endswith("/numbering.xml") or normalized == "word/numbering.xml":
                numbering_part = normalized
                break

    if not numbering_part:
        return {}, {}

    numbering_root = read_xml_from_zip(docx, numbering_part)
    if numbering_root is None:
        return {}, {}

    abstract_map = {}
    for abstract_num in find_children(numbering_root, "abstractNum"):
        abstract_id = get_attr_by_local_name(abstract_num, "abstractNumId")
        if not abstract_id:
            continue

        levels = {}
        for level in find_children(abstract_num, "lvl"):
            ilvl = int(get_attr_by_local_name(level, "ilvl", "0") or "0")
            num_fmt = get_attr_by_local_name(find_child(level, "numFmt"), "val", "decimal") or "decimal"
            level_text = get_attr_by_local_name(find_child(level, "lvlText"), "val", "")
            levels[ilvl] = {
                "numFmt": num_fmt,
                "lvlText": level_text,
            }
        abstract_map[abstract_id] = levels

    num_map = {}
    for num in find_children(numbering_root, "num"):
        num_id = get_attr_by_local_name(num, "numId")
        abstract_id = get_attr_by_local_name(find_child(num, "abstractNumId"), "val", "")
        if num_id and abstract_id:
            num_map[num_id] = abstract_id

    return num_map, abstract_map


def extract_run_text(run):
    parts = []
    for node in run.iter():
        tag = local_name(node.tag)
        if tag in {"t", "instrText"}:
            parts.append(node.text or "")
        elif tag == "tab":
            parts.append("\t")
        elif tag in {"br", "cr"}:
            parts.append("\n")
        elif tag == "noBreakHyphen":
            parts.append("-")
    return "".join(parts)


def normalize_whitespace(text):
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def extract_paragraph_text(paragraph):
    parts = []
    for run in find_descendants(paragraph, "r"):
        parts.append(extract_run_text(run))
    return normalize_whitespace("".join(parts))


def get_heading_prefix(paragraph):
    ppr = find_child(paragraph, "pPr")
    if ppr is None:
        return ""

    style_id = get_attr_by_local_name(find_child(ppr, "pStyle"), "val", "")
    normalized = style_id.lower().replace(" ", "")
    match = re.search(r"heading(\d+)", normalized)
    if match:
        level = max(1, min(6, int(match.group(1))))
        return "#" * level + " "

    outline_level = get_attr_by_local_name(find_child(ppr, "outlineLvl"), "val", "")
    if outline_level.isdigit():
        level = max(1, min(6, int(outline_level) + 1))
        return "#" * level + " "

    return ""


def build_number_prefix(paragraph, counters, num_map, abstract_map):
    ppr = find_child(paragraph, "pPr")
    if ppr is None:
        return ""

    num_pr = find_child(ppr, "numPr")
    if num_pr is None:
        return ""

    num_id = get_attr_by_local_name(find_child(num_pr, "numId"), "val", "")
    ilvl = int(get_attr_by_local_name(find_child(num_pr, "ilvl"), "val", "0") or "0")
    if not num_id:
        return ""

    abstract_id = num_map.get(num_id, "")
    level_map = abstract_map.get(abstract_id, {})
    level_def = level_map.get(ilvl, {})
    num_fmt = level_def.get("numFmt", "decimal")
    lvl_text = level_def.get("lvlText", "")

    counters[num_id][ilvl] += 1
    for deeper_level in list(counters[num_id].keys()):
        if deeper_level > ilvl:
            counters[num_id][deeper_level] = 0

    if num_fmt in {"bullet", "none"} or not lvl_text:
        return "- "

    prefix = lvl_text
    for level_index in range(9):
        placeholder = f"%{level_index + 1}"
        if placeholder in prefix:
            value = counters[num_id].get(level_index, 0) or 1
            prefix = prefix.replace(placeholder, str(value))

    prefix = prefix.strip()
    if not prefix:
        return ""
    if prefix.endswith(PUNCTUATION_SUFFIXES):
        return f"{prefix} "
    return f"{prefix} "


def extract_table_text(table, counters, num_map, abstract_map):
    lines = []
    for row in find_children(table, "tr"):
        cells = []
        for cell in find_children(row, "tc"):
            fragments = []
            for paragraph in find_children(cell, "p"):
                text = convert_paragraph(paragraph, counters, num_map, abstract_map)
                if text:
                    fragments.append(text)
            cells.append(" ".join(fragments).strip())
        if any(cells):
            lines.append(" | ".join(cells))
    return lines


def convert_paragraph(paragraph, counters, num_map, abstract_map):
    text = extract_paragraph_text(paragraph)
    if not text:
        return ""

    heading_prefix = get_heading_prefix(paragraph)
    number_prefix = build_number_prefix(paragraph, counters, num_map, abstract_map)
    prefix = heading_prefix or number_prefix
    return normalize_whitespace(f"{prefix}{text}")


def extract_template_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            document_part = find_main_document_part(docx)
            if not document_part:
                raise ValueError("docx 文件中没有找到主文档部件，可能不是标准的 Word 文档。")

            document_root = read_xml_from_zip(docx, document_part)
            if document_root is None:
                raise ValueError(f"docx 文件中缺少主文档内容：{document_part}。")

            num_map, abstract_map = build_numbering_maps(docx, document_part)
            counters = defaultdict(lambda: defaultdict(int))

            body = find_child(document_root, "body") or find_first_descendant(document_root, "body")
            if body is None:
                raise ValueError("docx 文件中缺少正文 body。")

            lines = []
            for child in list(body):
                tag = local_name(child.tag)
                if tag == "p":
                    text = convert_paragraph(child, counters, num_map, abstract_map)
                    if text:
                        lines.append(text)
                elif tag == "tbl":
                    lines.extend(extract_table_text(child, counters, num_map, abstract_map))

            content = "\n\n".join(line for line in lines if line.strip()).strip()
            if not content:
                raise ValueError("没有从 docx 中提取到可用文本。")
            return content
    except zipfile.BadZipFile as exc:
        raise ValueError("上传的文件不是有效的 .docx 压缩包。") from exc
    except OSError as exc:
        raise ValueError(f"无法读取文件：{exc}") from exc


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "缺少 docx 文件路径。"}, ensure_ascii=False))
        return 1

    docx_path = Path(sys.argv[1])
    try:
        content = extract_template_text(docx_path)
        payload = {
            "ok": True,
            "fileName": docx_path.name,
            "text": content,
        }
        print(json.dumps(payload, ensure_ascii=False))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
