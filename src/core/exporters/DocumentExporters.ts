// DocumentExporters — Multi-Surface PDF Deck & EPUB3 e-Book Generators
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { SlideData, CuePoint, ExportProgress } from '@/types';
import { ThreeSceneManager } from '../scene/ThreeSceneManager';
import { TimelineController } from '../motion/TimelineController';

/**
 * Exports the interactive slide deck to a crisp, high-resolution 1920x1080 Landscape PDF
 */
export async function exportDeckToPdf(
  slides: SlideData[],
  cues: CuePoint[],
  threeScene: ThreeSceneManager,
  timeline: TimelineController,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  onProgress?.({
    stage: 'preparing',
    progress: 5,
    message: 'Initializing 1920x1080 vector PDF document...',
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
    compress: true,
  });

  const canvas = threeScene.getCanvas();

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const cue = cues.find((c) => c.slideIndex === i) || cues[0];

    onProgress?.({
      stage: 'rendering',
      progress: Math.round(10 + (i / slides.length) * 75),
      message: `Rendering 3D viewport for Slide ${i + 1} of ${slides.length}: "${slide.title}"`,
    });

    // 1. Move timeline to cue point and force synchronous WebGL render
    timeline.seek(cue.time);
    threeScene.setCameraPreset(slide.cameraPreset);
    threeScene.setDevice(slide.deviceType);
    threeScene.renderDirect();

    // 2. Capture canvas buffer
    const imgData = canvas.toDataURL('image/png', 1.0);

    if (i > 0) {
      pdf.addPage([1920, 1080], 'landscape');
    }

    // 3. Draw Dark Gradient Background on PDF
    pdf.setFillColor(9, 11, 16);
    pdf.rect(0, 0, 1920, 1080, 'F');

    // Subtle background grid accent
    pdf.setDrawColor(36, 44, 61);
    pdf.setLineWidth(1);
    for (let x = 0; x < 1920; x += 120) {
      pdf.line(x, 0, x, 1080);
    }
    for (let y = 0; y < 1080; y += 120) {
      pdf.line(0, y, 1920, y);
    }

    // 4. Render 3D Canvas Snapshot
    pdf.addImage(imgData, 'PNG', 480, 100, 1400, 880);

    // 5. Draw Slide Typography & Content Panel
    pdf.setFillColor(16, 20, 29);
    pdf.roundedRect(60, 120, 560, 840, 20, 20, 'F');

    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(2);
    pdf.roundedRect(60, 120, 560, 840, 20, 20, 'S');

    // Category Pill Badge
    pdf.setFillColor(59, 130, 246);
    pdf.roundedRect(90, 160, 180, 36, 18, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(`SLIDE ${i + 1} OF ${slides.length}`, 180, 184, { align: 'center' });

    // Slide Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(36);
    const splitTitle = pdf.splitTextToSize(slide.title, 500);
    pdf.text(splitTitle, 90, 240);

    // Subtitle
    pdf.setTextColor(96, 165, 250);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(20);
    const splitSubtitle = pdf.splitTextToSize(slide.subtitle, 500);
    pdf.text(splitSubtitle, 90, 320);

    // Bullet Points
    pdf.setTextColor(226, 232, 240);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(18);
    let bulletY = 400;
    slide.content.forEach((point) => {
      pdf.setFillColor(59, 130, 246);
      pdf.circle(98, bulletY - 5, 4, 'F');
      const splitPoint = pdf.splitTextToSize(point, 470);
      pdf.text(splitPoint, 115, bulletY);
      bulletY += splitPoint.length * 28 + 20;
    });

    // Notes
    if (slide.notes) {
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(15);
      const splitNotes = pdf.splitTextToSize(`Notes: ${slide.notes}`, 500);
      pdf.text(splitNotes, 90, 880);
    }

    // Footer Watermark
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.text('Generated with MotionStudio • 3D Spatial Presentation & Multi-Surface Publishing', 90, 1040);
  }

  onProgress?.({
    stage: 'packaging',
    progress: 92,
    message: 'Compressing and generating PDF output blob...',
  });

  const blob = pdf.output('blob');

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'PDF deck generated successfully!',
  });

  return blob;
}

/**
 * Generates a fully standards-compliant EPUB3 container with rendered visual slides and structured XHTML
 */
export async function exportToEpub(
  slides: SlideData[],
  cues: CuePoint[],
  presentationTitle: string,
  threeScene: ThreeSceneManager,
  timeline: TimelineController,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  onProgress?.({
    stage: 'preparing',
    progress: 5,
    message: 'Constructing EPUB3 archive structure...',
  });

  const zip = new JSZip();
  const canvas = threeScene.getCanvas();
  const renderedImages: { filename: string; base64: string }[] = [];

  // 1. Render all slide images
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const cue = cues.find((c) => c.slideIndex === i) || cues[0];

    onProgress?.({
      stage: 'rendering',
      progress: Math.round(10 + (i / slides.length) * 60),
      message: `Rendering EPUB visual slide ${i + 1} of ${slides.length}...`,
    });

    timeline.seek(cue.time);
    threeScene.setCameraPreset(slide.cameraPreset);
    threeScene.setDevice(slide.deviceType);
    threeScene.renderDirect();

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    renderedImages.push({
      filename: `slide_${i + 1}.png`,
      base64: base64Data,
    });
  }

  onProgress?.({
    stage: 'encoding',
    progress: 75,
    message: 'Packaging metadata, OPF manifest, and XHTML chapters...',
  });

  // 2. EPUB Standard: mimetype MUST be first, uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 3. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  // 4. Add Images
  const imgFolder = zip.folder('OEBPS/images');
  renderedImages.forEach((img) => {
    imgFolder?.file(img.filename, img.base64, { base64: true });
  });

  // 5. CSS Stylesheet
  const css = `
@charset "UTF-8";
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 24px;
  background-color: #0b0f19;
  color: #f1f5f9;
  line-height: 1.6;
}
.slide-card {
  max-width: 960px;
  margin: 0 auto;
  background: #131b2e;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.badge {
  display: inline-block;
  background: #3b82f6;
  color: white;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
h1 {
  font-size: 28px;
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 8px;
}
h2 {
  font-size: 18px;
  color: #60a5fa;
  font-weight: normal;
  margin-top: 0;
  margin-bottom: 24px;
}
.image-container {
  text-align: center;
  margin: 24px 0;
}
img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  border: 1px solid #334155;
}
ul {
  padding-left: 24px;
  margin-bottom: 24px;
}
li {
  font-size: 16px;
  margin-bottom: 8px;
  color: #cbd5e1;
}
.notes {
  border-left: 4px solid #3b82f6;
  padding-left: 16px;
  color: #94a3b8;
  font-style: italic;
  margin-top: 24px;
}
.footer {
  text-align: center;
  font-size: 12px;
  color: #64748b;
  margin-top: 32px;
}
`;
  zip.file('OEBPS/styles.css', css);

  // 6. Generate Individual Chapter XHTML Files
  slides.forEach((slide, i) => {
    const chapterHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
<head>
  <title>${escapeXml(slide.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <div class="slide-card">
    <div class="badge">Chapter ${i + 1} • Slide Showcase</div>
    <h1>${escapeXml(slide.title)}</h1>
    <h2>${escapeXml(slide.subtitle)}</h2>
    <div class="image-container">
      <img src="images/slide_${i + 1}.png" alt="${escapeXml(slide.title)}" />
    </div>
    <ul>
      ${slide.content.map((pt) => `<li>${escapeXml(pt)}</li>`).join('\n      ')}
    </ul>
    ${slide.notes ? `<div class="notes">Presenter Notes: ${escapeXml(slide.notes)}</div>` : ''}
    <div class="footer">MotionStudio EPUB3 Visual Showcase Publication</div>
  </div>
</body>
</html>`;
    zip.file(`OEBPS/chapter_${i + 1}.xhtml`, chapterHtml);
  });

  // 7. Navigation XHTML (EPUB3 nav)
  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${slides
        .map(
          (slide, i) =>
            `<li><a href="chapter_${i + 1}.xhtml">${escapeXml(slide.title)}</a></li>`
        )
        .join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;
  zip.file('OEBPS/nav.xhtml', navXhtml);

  // 8. Legacy NCX (toc.ncx)
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:motionstudio-${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(presentationTitle)}</text></docTitle>
  <navMap>
    ${slides
      .map(
        (slide, i) => `
    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(slide.title)}</text></navLabel>
      <content src="chapter_${i + 1}.xhtml"/>
    </navPoint>`
      )
      .join('')}
  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', ncx);

  // 9. OPF Package Manifest (content.opf)
  const dateStr = new Date().toISOString().split('T')[0];
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(presentationTitle)}</dc:title>
    <dc:creator>MotionStudio Presenter</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookID">urn:uuid:motionstudio-${Date.now()}</dc:identifier>
    <dc:date>${dateStr}</dc:date>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="styles" href="styles.css" media-type="text/css"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${slides
      .map(
        (_, i) =>
          `<item id="chap_${i + 1}" href="chapter_${i + 1}.xhtml" media-type="application/xhtml+xml"/>\n    <item id="img_${i + 1}" href="images/slide_${i + 1}.png" media-type="image/png"/>`
      )
      .join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${slides.map((_, i) => `<itemref idref="chap_${i + 1}"/>`).join('\n    ')}
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', opf);

  onProgress?.({
    stage: 'packaging',
    progress: 90,
    message: 'Compressing valid EPUB3 container...',
  });

  const epubBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'EPUB3 e-Book generated successfully!',
  });

  return epubBlob;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

/**
 * Downloads any generated blob with a clean user filename
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
