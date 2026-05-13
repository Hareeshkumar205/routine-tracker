import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportElementToPDF = async (element, filename) => {
  if (!element) return;
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f172a' : '#f8fafc',
    });
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate aspect ratio to prevent clipping long lists
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Create a custom page size to fit the entire content on one page
    const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF", error);
    alert("Failed to generate PDF.");
  }
};
