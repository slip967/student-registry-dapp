const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');

// Register a font (you can add custom fonts to server/fonts folder)
try {
  registerFont(path.join(__dirname, 'fonts', 'Arial.ttf'), { family: 'Arial' });
} catch (e) {
  console.log('Using default font - Arial.ttf not found');
}

async function generateDiploma(studentData) {
  const canvas = createCanvas(1200, 900);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, 1200, 900);

  // Border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 1160, 860);

  // Inner border
  ctx.strokeStyle = '#8b7355';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 1120, 820);

  // Header background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(60, 60, 1080, 120);

  // Title
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DIPLOMA', 600, 120);

  // Subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.fillText('Certificate of Achievement', 600, 150);

  // Main content area
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('This is to certify that', 350, 250);

  // Student name
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(studentData.name, 600, 320);

  // Course information
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '20px Arial';
  ctx.fillText('has successfully completed the course', 350, 380);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(studentData.course, 600, 430);

  // Additional details
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Student ID: ${studentData.id}`, 350, 500);
  ctx.fillText(`Date of Birth: ${studentData.dateOfBirth}`, 350, 530);
  ctx.fillText(`Average Grade: ${studentData.averageGrade}%`, 350, 560);
  ctx.fillText(`Status: ${studentData.status}`, 350, 590);

  // Date issued
  ctx.textAlign = 'right';
  ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, 850, 530);

  // Signature lines
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(350, 750);
  ctx.lineTo(550, 750);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(650, 750);
  ctx.lineTo(850, 750);
  ctx.stroke();

  ctx.fillStyle = '#1a1a1a';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Director Signature', 450, 780);
  ctx.fillText('Institution Seal', 750, 780);

  // Add decorative elements
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Student Registry NFT Diploma', 600, 850);

  // Generate unique ID for the diploma
  const diplomaId = `DIP-${studentData.id}-${Date.now()}`;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText(`ID: ${diplomaId}`, 600, 870);

  return canvas.toBuffer('image/jpeg', { quality: 0.9 });
}

module.exports = { generateDiploma };
