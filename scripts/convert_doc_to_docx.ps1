param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = "Stop"
$word = $null
$document = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0

  $document = $word.Documents.Open($InputPath, $false, $true)
  $docxFormat = 16
  $document.SaveAs([ref]$OutputPath, [ref]$docxFormat)
  $document.Close([ref]$false)
  $document = $null

  $word.Quit()
  $word = $null

  Write-Output '{"ok":true}'
}
catch {
  if ($document -ne $null) {
    try {
      $document.Close([ref]$false)
    }
    catch {
    }
  }

  if ($word -ne $null) {
    try {
      $word.Quit()
    }
    catch {
    }
  }

  $message = $_.Exception.Message.Replace('"', '\"')
  Write-Output ("{""ok"":false,""error"":""" + $message + """}")
  exit 1
}
