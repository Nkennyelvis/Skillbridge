const PDFDocument = require('pdfkit');
const { Certificate } = require('../models');
const crypto = require('crypto');

/**
 * Generate a PDF certificate and save record to DB.
 * Returns the Certificate document.
 * (In production, upload PDF buffer to cloud storage and store URL)
 */
exports.generateCertificate = async (user, course, enrollment) => {
  const certId = `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

  // Create a PDF in memory
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  await new Promise((resolve) => {
    doc.on('end', resolve);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#3A7BFF');

    // Header
    doc.fillColor('#3A7BFF').fontSize(36).font('Helvetica-Bold')
      .text('SkillBridge LMS', 0, 60, { align: 'center' });

    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
      .text('CERTIFICATE OF COMPLETION', 0, 105, { align: 'center', characterSpacing: 4 });

    // Decorative line
    doc.moveTo(150, 130).lineTo(doc.page.width - 150, 130).strokeColor('#3A7BFF').lineWidth(1).stroke();

    // Body
    doc.fillColor('#e2e8f0').fontSize(18).font('Helvetica')
      .text('This is to certify that', 0, 160, { align: 'center' });

    doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold')
      .text(user.name, 0, 190, { align: 'center' });

    doc.fillColor('#e2e8f0').fontSize(18).font('Helvetica')
      .text('has successfully completed the course', 0, 240, { align: 'center' });

    doc.fillColor('#28C76F').fontSize(26).font('Helvetica-Bold')
      .text(course.title, 0, 270, { align: 'center' });

    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
      .text(`Category: ${course.category} | Level: ${course.level}`, 0, 310, { align: 'center' });

    // Date and ID
    const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor('#64748b').fontSize(12)
      .text(`Issued: ${issueDate}`, 100, 370)
      .text(`Certificate ID: ${certId}`, 100, 390)
      .text(`Instructor: ${course.tutorName || 'SkillBridge Instructor'}`, doc.page.width - 350, 370);

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);
  // In production: upload pdfBuffer to S3/Cloudinary → get URL
  // For now we store base64 as a data URL (small certs only)
  const certificateUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

  const cert = await Certificate.create({
    userId: user._id,
    courseId: course._id,
    issueDate: new Date(),
    certificateUrl,
    certificateId: certId,
  });

  return cert;
};
