Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

function New-PointF {
  param(
    [float]$X,
    [float]$Y
  )

  return [System.Drawing.PointF]::new($X, $Y)
}

function Lerp-Point {
  param(
    [System.Drawing.PointF]$A,
    [System.Drawing.PointF]$B,
    [float]$T
  )

  return [System.Drawing.PointF]::new(
    $A.X + (($B.X - $A.X) * $T),
    $A.Y + (($B.Y - $A.Y) * $T)
  )
}

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath

  if ($Radius -le 0) {
    $path.AddRectangle([System.Drawing.RectangleF]::new($X, $Y, $Width, $Height))
    return $path
  }

  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

function Add-Glow {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [System.Drawing.Color]$CenterColor,
    [System.Drawing.Color]$EdgeColor
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse($X, $Y, $Width, $Height)
  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
  $brush.CenterColor = $CenterColor
  $brush.SurroundColors = [System.Drawing.Color[]]@($EdgeColor)
  $Graphics.FillPath($brush, $path)
  $brush.Dispose()
  $path.Dispose()
}

function Draw-Arrow {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.PointF]$From,
    [System.Drawing.PointF]$To,
    [System.Drawing.Color]$Color,
    [float]$Width = 2.0,
    [float]$HeadSize = 12.0
  )

  $dx = $To.X - $From.X
  $dy = $To.Y - $From.Y
  $length = [Math]::Sqrt(($dx * $dx) + ($dy * $dy))
  if ($length -lt 0.1) {
    return
  }

  $ux = $dx / $length
  $uy = $dy / $length
  $nx = -$uy
  $ny = $ux

  $lineEnd = New-PointF ($To.X - ($ux * $HeadSize)) ($To.Y - ($uy * $HeadSize))
  $pen = New-Object System.Drawing.Pen($Color, $Width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $Graphics.DrawLine($pen, $From, $lineEnd)

  $tip = $To
  $base = New-PointF ($To.X - ($ux * $HeadSize)) ($To.Y - ($uy * $HeadSize))
  $p1 = New-PointF ($base.X + ($nx * ($HeadSize * 0.48))) ($base.Y + ($ny * ($HeadSize * 0.48)))
  $p2 = New-PointF ($base.X - ($nx * ($HeadSize * 0.48))) ($base.Y - ($ny * ($HeadSize * 0.48)))
  $brush = New-Object System.Drawing.SolidBrush($Color)
  $Graphics.FillPolygon($brush, [System.Drawing.PointF[]]@($tip, $p1, $p2))

  $brush.Dispose()
  $pen.Dispose()
}

function Draw-Dot {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Size,
    [System.Drawing.Color]$Color
  )

  $brush = New-Object System.Drawing.SolidBrush($Color)
  $Graphics.FillEllipse($brush, $X - ($Size / 2), $Y - ($Size / 2), $Size, $Size)
  $brush.Dispose()
}

function Draw-SystemCard {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [string]$Step,
    [string]$Title,
    [string]$Detail,
    [System.Drawing.Color]$Accent
  )

  $shadowPath = New-RoundedRectPath ($X + 10) ($Y + 14) $Width $Height 22
  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 0, 0, 0))
  $Graphics.FillPath($shadowBrush, $shadowPath)
  $shadowBrush.Dispose()
  $shadowPath.Dispose()

  $path = New-RoundedRectPath $X $Y $Width $Height 22
  $fillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(228, 18, 20, 24))
  $Graphics.FillPath($fillBrush, $path)
  $fillBrush.Dispose()

  $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(88, 212, 168, 48), 1.25)
  $Graphics.DrawPath($borderPen, $path)
  $borderPen.Dispose()

  $highlightPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(38, 255, 255, 255), 1)
  $Graphics.DrawLine($highlightPen, $X + 22, $Y + 18, $X + $Width - 22, $Y + 18)
  $highlightPen.Dispose()

  $stepFont = New-Object System.Drawing.Font('Consolas', 9, [System.Drawing.FontStyle]::Regular)
  $titleFont = New-Object System.Drawing.Font('Segoe UI Semibold', 17, [System.Drawing.FontStyle]::Bold)
  $detailFont = New-Object System.Drawing.Font('Consolas', 8.5, [System.Drawing.FontStyle]::Regular)
  $miniFont = New-Object System.Drawing.Font('Consolas', 8, [System.Drawing.FontStyle]::Regular)

  $stepBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 207, 176, 104))
  $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 242, 243, 244))
  $detailBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(145, 174, 179, 187))
  $miniBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(145, 150, 154, 160))
  $accentBrush = New-Object System.Drawing.SolidBrush($Accent)
  $trackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 255, 255))

  $Graphics.FillEllipse($accentBrush, $X + 18, $Y + 16, 8, 8)
  $Graphics.DrawString($Step, $stepFont, $stepBrush, $X + 34, $Y + 11)
  $Graphics.DrawString($Title, $titleFont, $titleBrush, $X + 18, $Y + 31)
  $Graphics.DrawString($Detail, $detailFont, $detailBrush, [System.Drawing.RectangleF]::new($X + 18, $Y + 60, $Width - 36, 28))

  $metrics = @(
    @{ X = 0.0; Width = 0.58; Label = 'TRIGGER' },
    @{ X = 0.62; Width = 0.18; Label = 'SYNC' },
    @{ X = 0.83; Width = 0.11; Label = 'LIVE' }
  )

  foreach ($metric in $metrics) {
    $barX = $X + 18 + (($Width - 36) * [float]$metric.X)
    $barW = ($Width - 36) * [float]$metric.Width
    $Graphics.FillRectangle($trackBrush, $barX, $Y + $Height - 26, $barW, 5)
    $Graphics.FillRectangle($accentBrush, $barX, $Y + $Height - 26, $barW * 0.75, 5)
    $Graphics.DrawString([string]$metric.Label, $miniFont, $miniBrush, $barX, $Y + $Height - 18)
  }

  $stepFont.Dispose()
  $titleFont.Dispose()
  $detailFont.Dispose()
  $miniFont.Dispose()
  $stepBrush.Dispose()
  $titleBrush.Dispose()
  $detailBrush.Dispose()
  $miniBrush.Dispose()
  $accentBrush.Dispose()
  $trackBrush.Dispose()
  $path.Dispose()
}

$width = 1600
$height = 1000
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-PointF 0 0),
  (New-PointF 0 $height),
  [System.Drawing.Color]::FromArgb(255, 7, 8, 10),
  [System.Drawing.Color]::FromArgb(255, 18, 20, 24)
)
$graphics.FillRectangle($backgroundBrush, 0, 0, $width, $height)
$backgroundBrush.Dispose()

Add-Glow -Graphics $graphics -X 90 -Y 60 -Width 620 -Height 360 `
  -CenterColor ([System.Drawing.Color]::FromArgb(50, 212, 168, 48)) `
  -EdgeColor ([System.Drawing.Color]::FromArgb(0, 212, 168, 48))

Add-Glow -Graphics $graphics -X 1060 -Y 250 -Width 440 -Height 440 `
  -CenterColor ([System.Drawing.Color]::FromArgb(26, 126, 94, 36)) `
  -EdgeColor ([System.Drawing.Color]::FromArgb(0, 126, 94, 36))

Add-Glow -Graphics $graphics -X 250 -Y 520 -Width 980 -Height 360 `
  -CenterColor ([System.Drawing.Color]::FromArgb(22, 255, 255, 255)) `
  -EdgeColor ([System.Drawing.Color]::FromArgb(0, 255, 255, 255))

$thinLinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(16, 255, 255, 255), 1)
for ($i = -2; $i -le 11; $i++) {
  $startX = 170 + ($i * 120)
  $graphics.DrawLine($thinLinePen, $startX, 0, $startX + 220, $height)
}
for ($i = 0; $i -le 7; $i++) {
  $y = 90 + ($i * 110)
  $graphics.DrawLine($thinLinePen, 0, $y, $width, $y - 50)
}
$thinLinePen.Dispose()

$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(34, 212, 168, 48), 1.1)
$ringPen.DashPattern = @(2.5, 5.5)
$graphics.DrawEllipse($ringPen, 170, 120, 420, 420)
$graphics.DrawEllipse($ringPen, 120, 70, 520, 520)
$graphics.DrawArc($ringPen, 270, 195, 220, 220, 215, 190)
$graphics.DrawLine($ringPen, 380, 95, 380, 370)
$graphics.DrawLine($ringPen, 245, 230, 515, 230)
$ringPen.Dispose()

$signalPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(72, 214, 179, 68), 2)
$signalPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$signalPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLines(
  $signalPen,
  [System.Drawing.PointF[]]@(
    (New-PointF 230 430),
    (New-PointF 290 395),
    (New-PointF 342 410),
    (New-PointF 412 348),
    (New-PointF 470 365),
    (New-PointF 560 290)
  )
)
$signalPen.Dispose()

$matTopLeft = New-PointF 250 565
$matTopRight = New-PointF 1330 565
$matBottomRight = New-PointF 1530 915
$matBottomLeft = New-PointF 85 915
$matPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$matPath.AddPolygon([System.Drawing.PointF[]]@($matTopLeft, $matTopRight, $matBottomRight, $matBottomLeft))
$matBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($matPath)
$matBrush.CenterColor = [System.Drawing.Color]::FromArgb(255, 28, 31, 35)
$matBrush.SurroundColors = [System.Drawing.Color[]]@([System.Drawing.Color]::FromArgb(255, 11, 12, 14))
$graphics.FillPath($matBrush, $matPath)
$matBrush.Dispose()

$matBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(62, 212, 168, 48), 1.3)
$graphics.DrawPath($matBorderPen, $matPath)
$matBorderPen.Dispose()

$matGridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(34, 212, 168, 48), 1)
for ($i = 1; $i -lt 8; $i++) {
  $t = $i / 8.0
  $top = Lerp-Point $matTopLeft $matTopRight $t
  $bottom = Lerp-Point $matBottomLeft $matBottomRight $t
  $graphics.DrawLine($matGridPen, $top, $bottom)
}
for ($i = 1; $i -lt 5; $i++) {
  $t = $i / 5.0
  $left = Lerp-Point $matTopLeft $matBottomLeft $t
  $right = Lerp-Point $matTopRight $matBottomRight $t
  $graphics.DrawLine($matGridPen, $left, $right)
}
$graphics.DrawLine(
  (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(66, 224, 191, 106), 2.1)),
  (Lerp-Point $matTopLeft $matTopRight 0.51),
  (Lerp-Point $matBottomLeft $matBottomRight 0.51)
)
$matGridPen.Dispose()

$lanePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(24, 255, 255, 255), 3)
$graphics.DrawLine($lanePen, 470, 635, 1110, 810)
$graphics.DrawLine($lanePen, 340, 710, 980, 870)
$lanePen.Dispose()

$labelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(124, 170, 176, 184))
$monoSmall = New-Object System.Drawing.Font('Consolas', 10, [System.Drawing.FontStyle]::Regular)
$monoTiny = New-Object System.Drawing.Font('Consolas', 8.5, [System.Drawing.FontStyle]::Regular)
$graphics.DrawString('STRUCTURED ENROLLMENT GRID', $monoSmall, $labelBrush, 148, 535)
$graphics.DrawString('DISCIPLINE / REPETITION / PERFORMANCE', $monoTiny, $labelBrush, 1160, 932)

$panelPath = New-RoundedRectPath 960 96 460 116 24
$panelShadow = New-RoundedRectPath 972 108 460 116 24
$panelShadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(65, 0, 0, 0))
$panelFillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(205, 17, 19, 22))
$panelBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(55, 212, 168, 48), 1.2)
$graphics.FillPath($panelShadowBrush, $panelShadow)
$graphics.FillPath($panelFillBrush, $panelPath)
$graphics.DrawPath($panelBorderPen, $panelPath)
$panelShadowBrush.Dispose()
$panelFillBrush.Dispose()
$panelBorderPen.Dispose()
$panelShadow.Dispose()

$panelTitleFont = New-Object System.Drawing.Font('Consolas', 9.5, [System.Drawing.FontStyle]::Regular)
$panelValueFont = New-Object System.Drawing.Font('Segoe UI Semibold', 18, [System.Drawing.FontStyle]::Bold)
$panelMutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(136, 165, 170, 176))
$panelBrightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(236, 242, 243, 244))
$panelAccentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 212, 168, 48))

$graphics.DrawString('PERFORMANCE SIGNAL', $panelTitleFont, $panelAccentBrush, 985, 122)
$graphics.DrawString('conversion velocity', $panelTitleFont, $panelMutedBrush, 1162, 122)
$graphics.DrawString('97.4%', $panelValueFont, $panelBrightBrush, 985, 148)

$chartTrackPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(32, 255, 255, 255), 1)
for ($i = 0; $i -lt 5; $i++) {
  $y = 136 + ($i * 16)
  $graphics.DrawLine($chartTrackPen, 1138, $y, 1385, $y)
}
$chartTrackPen.Dispose()

$chartLinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 212, 168, 48), 2.2)
$chartLinePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$chartLinePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLines(
  $chartLinePen,
  [System.Drawing.PointF[]]@(
    (New-PointF 1146 189),
    (New-PointF 1192 182),
    (New-PointF 1238 170),
    (New-PointF 1280 178),
    (New-PointF 1328 150),
    (New-PointF 1378 126)
  )
)
$chartLinePen.Dispose()

Draw-Dot -Graphics $graphics -X 1378 -Y 126 -Size 8 -Color ([System.Drawing.Color]::FromArgb(220, 212, 168, 48))

$cards = @(
  @{ X = 935; Y = 250; Step = '01'; Title = 'INQUIRY CAPTURED'; Detail = 'form event, intent score, owner notified'; Accent = [System.Drawing.Color]::FromArgb(228, 212, 168, 48) },
  @{ X = 1015; Y = 408; Step = '02'; Title = 'TRIAL LOCKED'; Detail = 'reminder sequence, calendar sync, friction removed'; Accent = [System.Drawing.Color]::FromArgb(228, 224, 182, 84) },
  @{ X = 1095; Y = 566; Step = '03'; Title = 'SHOW-UP PROTECTED'; Detail = 'confirmation loop, no-show recovery, second chance'; Accent = [System.Drawing.Color]::FromArgb(228, 201, 152, 52) },
  @{ X = 1175; Y = 724; Step = '04'; Title = 'ENROLLMENT CLOSED'; Detail = 'handoff complete, pipeline visible, revenue retained'; Accent = [System.Drawing.Color]::FromArgb(228, 212, 168, 48) }
)

foreach ($card in $cards) {
  Draw-SystemCard -Graphics $graphics -X $card.X -Y $card.Y -Width 355 -Height 118 `
    -Step $card.Step -Title $card.Title -Detail $card.Detail -Accent $card.Accent
}

$connectorColor = [System.Drawing.Color]::FromArgb(140, 212, 168, 48)
Draw-Arrow -Graphics $graphics -From (New-PointF 1110 211) -To (New-PointF 1080 250) -Color $connectorColor -Width 2.1 -HeadSize 12
Draw-Arrow -Graphics $graphics -From (New-PointF 1118 368) -To (New-PointF 1094 408) -Color $connectorColor -Width 2.1 -HeadSize 12
Draw-Arrow -Graphics $graphics -From (New-PointF 1198 526) -To (New-PointF 1174 566) -Color $connectorColor -Width 2.1 -HeadSize 12
Draw-Arrow -Graphics $graphics -From (New-PointF 1278 684) -To (New-PointF 1254 724) -Color $connectorColor -Width 2.1 -HeadSize 12

$flowLinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(86, 212, 168, 48), 2)
$flowLinePen.DashPattern = @(4, 6)
$graphics.DrawBezier(
  $flowLinePen,
  (New-PointF 560 320),
  (New-PointF 710 280),
  (New-PointF 820 370),
  (New-PointF 960 300)
)
$graphics.DrawBezier(
  $flowLinePen,
  (New-PointF 648 640),
  (New-PointF 775 600),
  (New-PointF 878 640),
  (New-PointF 1030 586)
)
$flowLinePen.Dispose()

Draw-Dot -Graphics $graphics -X 560 -Y 320 -Size 8 -Color ([System.Drawing.Color]::FromArgb(190, 212, 168, 48))
Draw-Dot -Graphics $graphics -X 960 -Y 300 -Size 7 -Color ([System.Drawing.Color]::FromArgb(190, 212, 168, 48))
Draw-Dot -Graphics $graphics -X 648 -Y 640 -Size 8 -Color ([System.Drawing.Color]::FromArgb(190, 212, 168, 48))
Draw-Dot -Graphics $graphics -X 1030 -Y 586 -Size 7 -Color ([System.Drawing.Color]::FromArgb(190, 212, 168, 48))

$cornerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(52, 255, 255, 255), 1.2)
$graphics.DrawLine($cornerPen, 74, 70, 132, 70)
$graphics.DrawLine($cornerPen, 74, 70, 74, 132)
$graphics.DrawLine($cornerPen, 1526, 70, 1468, 70)
$graphics.DrawLine($cornerPen, 1526, 70, 1526, 132)
$graphics.DrawLine($cornerPen, 74, 930, 74, 870)
$graphics.DrawLine($cornerPen, 74, 930, 132, 930)
$graphics.DrawLine($cornerPen, 1526, 930, 1468, 930)
$graphics.DrawLine($cornerPen, 1526, 930, 1526, 870)
$cornerPen.Dispose()

$overlayPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$overlayPath.AddRectangle([System.Drawing.RectangleF]::new(0, 0, $width, $height))
$overlayBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($overlayPath)
$overlayBrush.CenterPoint = New-PointF 770 520
$overlayBrush.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
$overlayBrush.SurroundColors = [System.Drawing.Color[]]@([System.Drawing.Color]::FromArgb(88, 0, 0, 0))
$graphics.FillRectangle($overlayBrush, 0, 0, $width, $height)
$overlayBrush.Dispose()
$overlayPath.Dispose()

$outPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\public\images\hero-matboss.png'))
$null = New-Item -ItemType Directory -Force -Path ([System.IO.Path]::GetDirectoryName($outPath))
$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$panelPath.Dispose()
$matPath.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
$labelBrush.Dispose()
$monoSmall.Dispose()
$monoTiny.Dispose()
$panelTitleFont.Dispose()
$panelValueFont.Dispose()
$panelMutedBrush.Dispose()
$panelBrightBrush.Dispose()
$panelAccentBrush.Dispose()

Write-Output $outPath
