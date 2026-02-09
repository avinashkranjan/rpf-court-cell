import jsPDF from 'jspdf';

// Helper function to add header to PDF
const addHeader = (doc: jsPDF, title: string, caseData: any) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(caseData.post_name || 'RPF POST', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text(title, 105, 30, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Case No: ${caseData.case_number}`, 20, 40);
  doc.text(`Date: ${new Date(caseData.case_date).toLocaleDateString()}`, 150, 40);
  doc.text(`Section: ${caseData.section_of_law} of Railway Act, 1989`, 20, 48);
  doc.line(20, 52, 190, 52);
};

// Helper to add accused info
const addAccusedInfo = (doc: jsPDF, accused: any, y: number) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Accused Details:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${accused.full_name}, S/O ${accused.father_name}`, 20, y + 6);
  doc.text(`Age/Gender: ${accused.age} Yrs / ${accused.gender}`, 20, y + 12);
  doc.text(`Address: ${accused.address_line1}, ${accused.district}, ${accused.state}-${accused.pincode || ''}`, 20, y + 18);
  doc.text(`Mobile: ${accused.mobile_number || 'N/A'}`, 20, y + 24);
  return y + 32;
};

// Helper to add signature image
const addSignature = (doc: jsPDF, signature: string, x: number, y: number, label: string) => {
  if (signature) {
    try {
      doc.addImage(signature, 'PNG', x, y, 40, 20);
    } catch (e) {
      doc.text('[Signature]', x, y + 10);
    }
  }
  doc.setFontSize(8);
  doc.text(label, x, y + 25);
};

export const generateSeizureMemoPDF = (data: any) => {
  const doc = new jsPDF();
  addHeader(doc, 'SEIZURE MEMO', data.caseData);
  
  let y = 60;
  y = addAccusedInfo(doc, data.accused, y);

  doc.setFontSize(10);
  doc.text(`Date of Seizure: ${new Date(data.seizure_date).toLocaleDateString()}`, 20, y);
  doc.text(`Time: ${data.seizure_time}`, 120, y);
  y += 8;
  doc.text(`Place: ${data.seizure_place}`, 20, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.text('Seized Articles:', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  if (data.seizedItems && data.seizedItems.length > 0) {
    data.seizedItems.forEach((item: any, index: number) => {
      doc.text(`${index + 1}. ${item.item_name} - Qty: ${item.quantity} ${item.unit}`, 25, y);
      if (item.remarks) {
        doc.text(`   Remarks: ${item.remarks}`, 25, y + 5);
        y += 5;
      }
      y += 8;
    });
  } else {
    doc.text('NIL', 25, y);
    y += 8;
  }

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Witnesses:', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  doc.text(`1. ${data.witness1_name}, ${data.witness1_address}`, 25, y);
  y += 6;
  doc.text(`2. ${data.witness2_name}, ${data.witness2_address}`, 25, y);

  y += 20;
  if (data.witness1_signature) addSignature(doc, data.witness1_signature, 20, y, 'Witness 1');
  if (data.witness2_signature) addSignature(doc, data.witness2_signature, 80, y, 'Witness 2');
  if (data.seizing_officer_signature) addSignature(doc, data.seizing_officer_signature, 140, y, `${data.seizing_officer_designation}/${data.seizing_officer_name}`);

  doc.save(`SeizureMemo_${data.caseData.case_number.replace(/\//g, '-')}.pdf`);
};

export const generateArrestMemoPDF = (data: any) => {
  const doc = new jsPDF();
  addHeader(doc, 'ARREST MEMO (ANNEXURE-A)', data.caseData);
  
  let y = 60;
  y = addAccusedInfo(doc, data.accused, y);

  doc.setFontSize(10);
  doc.text(`Date of Arrest: ${new Date(data.arrest_date).toLocaleDateString()}`, 20, y);
  doc.text(`Time: ${data.arrest_time}`, 120, y);
  y += 8;
  doc.text(`Place of Arrest: ${data.arrest_place}`, 20, y);
  y += 8;
  doc.text(`Detention Place: ${data.detention_place}`, 20, y);
  y += 8;
  doc.text(`GD Entry No: ${data.gd_entry_number}`, 20, y);
  y += 8;
  doc.text(`Court: ${data.court_name}`, 20, y);
  y += 8;
  doc.text(`Production Date: ${new Date(data.court_production_date).toLocaleDateString()} at ${data.court_production_time}`, 20, y);
  y += 12;

  if (data.has_injuries) {
    doc.setFont('helvetica', 'bold');
    doc.text('Injury Details:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    doc.text(data.injury_details || 'None specified', 25, y);
    y += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Witnesses:', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  doc.text(`1. ${data.witness1_name}, ${data.witness1_address}`, 25, y);
  y += 6;
  doc.text(`2. ${data.witness2_name}, ${data.witness2_address}`, 25, y);

  y += 20;
  if (data.accused_signature) addSignature(doc, data.accused_signature, 20, y, 'Accused');
  if (data.arresting_officer_signature) addSignature(doc, data.arresting_officer_signature, 140, y, `${data.arresting_officer_designation}/${data.arresting_officer_name}`);

  doc.save(`ArrestMemo_${data.caseData.case_number.replace(/\//g, '-')}.pdf`);
};

export const generatePersonalSearchPDF = (data: any) => {
  const doc = new jsPDF();
  addHeader(doc, 'PERSONAL SEARCH MEMO', data.caseData);
  
  let y = 60;
  y = addAccusedInfo(doc, data.accused, y);

  doc.setFontSize(10);
  doc.text(`Date of Search: ${new Date(data.search_date).toLocaleDateString()}`, 20, y);
  doc.text(`Time: ${data.search_time}`, 120, y);
  y += 8;
  doc.text(`Place: ${data.search_place}`, 20, y);
  y += 12;

  if (data.is_nil_search) {
    doc.setFont('helvetica', 'bold');
    doc.text('NIL SEARCH - Nothing found on person', 20, y);
    doc.setFont('helvetica', 'normal');
  } else {
    doc.text(`Cash Found: ₹${data.cash_found || 0}`, 20, y);
    y += 8;

    if (data.searchItems && data.searchItems.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Articles Found:', 20, y);
      doc.setFont('helvetica', 'normal');
      y += 8;
      data.searchItems.forEach((item: any, index: number) => {
        doc.text(`${index + 1}. ${item.item_name} - Qty: ${item.quantity}`, 25, y);
        y += 6;
      });
    }

    if (data.articles_found) {
      y += 4;
      doc.text(`Additional: ${data.articles_found}`, 20, y);
    }
  }

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Witnesses:', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  doc.text(`1. ${data.witness1_name}, ${data.witness1_address}`, 25, y);
  y += 6;
  doc.text(`2. ${data.witness2_name}, ${data.witness2_address}`, 25, y);

  y += 20;
  if (data.accused_signature) addSignature(doc, data.accused_signature, 20, y, 'Accused');
  if (data.searching_officer_signature) addSignature(doc, data.searching_officer_signature, 140, y, `${data.searching_officer_designation}/${data.searching_officer_name}`);

  doc.save(`PersonalSearchMemo_${data.caseData.case_number.replace(/\//g, '-')}.pdf`);
};

export const generateMedicalMemoPDF = (data: any) => {
  const doc = new jsPDF();
  addHeader(doc, 'MEDICAL/INSPECTION MEMO', data.caseData);
  
  let y = 60;
  y = addAccusedInfo(doc, data.accused, y);

  doc.setFontSize(10);
  doc.text(`Date of Examination: ${new Date(data.examination_date).toLocaleDateString()}`, 20, y);
  doc.text(`Time: ${data.examination_time}`, 120, y);
  y += 8;
  doc.text(`Hospital/Unit: ${data.hospital_name}`, 20, y);
  y += 8;
  doc.text(`Medical Officer: ${data.medical_officer_name}`, 20, y);
  y += 8;
  doc.text(`Fitness Status: ${data.fitness_status.replace(/_/g, ' ').toUpperCase()}`, 20, y);
  y += 12;

  if (data.has_injuries) {
    doc.setFont('helvetica', 'bold');
    doc.text('Injury Details:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    const lines = doc.splitTextToSize(data.injury_description || 'None specified', 170);
    doc.text(lines, 25, y);
    y += lines.length * 5 + 10;
  }

  if (data.remarks) {
    doc.setFont('helvetica', 'bold');
    doc.text('Remarks:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    doc.text(data.remarks, 25, y);
    y += 10;
  }

  y += 15;
  if (data.doctor_signature) addSignature(doc, data.doctor_signature, 140, y, `Dr. ${data.medical_officer_name}`);

  doc.save(`MedicalMemo_${data.caseData.case_number.replace(/\//g, '-')}.pdf`);
};

export const generateBNSSChecklistPDF = (data: any) => {
  const doc = new jsPDF();
  addHeader(doc, 'BNSS ARREST CHECKLIST', data.caseData);
  
  let y = 60;
  
  doc.setFontSize(10);
  doc.text('This notice is issued to inform the arrested person about the grounds of arrest', 20, y);
  doc.text('in compliance with Section 35 of BNSS.', 20, y + 5);
  y += 15;

  y = addAccusedInfo(doc, data.accused, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Grounds of Arrest (ticked):', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 10;

  const grounds = [
    { key: 'ground_a_prevent_offence', label: '(a) To prevent such person from committing any further offence' },
    { key: 'ground_b_proper_investigation', label: '(b) For proper investigation of the offence' },
    { key: 'ground_c_evidence_protection', label: '(c) To prevent evidence tampering' },
    { key: 'ground_d_prevent_inducement', label: '(d) To prevent inducement/threat to witnesses' },
    { key: 'ground_e_ensure_court_presence', label: '(e) To ensure court presence' },
  ];

  grounds.forEach((ground) => {
    const checked = data[ground.key] ? '☑' : '☐';
    doc.text(`${checked} ${ground.label}`, 25, y);
    y += 8;
  });

  y += 15;
  doc.text(`Name and designation of the arresting officer:`, 20, y);
  y += 6;
  doc.text(`${data.officer_designation}/ ${data.officer_name}`, 20, y);
  y += 6;
  doc.text(data.caseData.post_name, 20, y);

  y += 20;
  if (data.officer_signature) addSignature(doc, data.officer_signature, 140, y, `${data.officer_designation}/${data.officer_name}`);

  doc.save(`BNSSChecklist_${data.caseData.case_number.replace(/\//g, '-')}.pdf`);
};

export const generateCourtForwardingPDF = (data: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`IN THE COURT OF ${data.caseData.court_name || 'Ld. RJM/HOWRAH'}`, 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Complaint- Cum-Prosecution Report of Railway Act', 105, 30, { align: 'center' });
  
  let y = 45;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`1. RAILWAY: ${data.railway_name}`, 20, y);
  y += 7;
  doc.text(`2. STATE: ${data.state_name}`, 20, y);
  y += 7;
  doc.text(`3. Case No. with date and Section: ${data.caseData.case_number}, Dtd-${new Date(data.caseData.case_date).toLocaleDateString()} U/S-${data.caseData.section_of_law}`, 20, y);
  y += 7;
  doc.text(`4. Name of Complainant: ${data.complainant_designation}/ ${data.complainant_name} of ${data.caseData.post_name}`, 20, y);
  y += 7;
  
  const accusedAddress = `${data.accused.full_name}, Mob No- ${data.accused.mobile_number || 'N/A'}, ${data.accused.gender}-${data.accused.age} Yrs, S/O- ${data.accused.father_name} of ${data.accused.address_line1}, Dist- ${data.accused.district}(${data.accused.state})`;
  const accusedLines = doc.splitTextToSize(`5. Name and address of accused person: ${accusedAddress}`, 170);
  doc.text(accusedLines, 20, y);
  y += accusedLines.length * 5 + 10;

  doc.text('Hon\'ble Sir,', 20, y);
  y += 10;

  const narrativeLines = doc.splitTextToSize(data.raid_description, 170);
  doc.text(narrativeLines, 20, y);
  y += narrativeLines.length * 4.5;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  y += 10;
  const bailLines = doc.splitTextToSize(data.bail_status, 170);
  doc.text(bailLines, 20, y);
  y += bailLines.length * 5 + 10;

  const prayerLines = doc.splitTextToSize(data.prayer_for_cognizance, 170);
  doc.text(prayerLines, 20, y);
  y += prayerLines.length * 5 + 15;

  doc.text('Yours faithfully', 140, y);
  y += 25;

  if (data.complainant_signature) {
    try {
      doc.addImage(data.complainant_signature, 'PNG', 140, y - 20, 40, 15);
    } catch (e) {}
  }

  doc.text(`(${data.complainant_name})`, 140, y);
  y += 5;
  doc.text(`${data.complainant_designation}/${data.caseData.post_name}`, 140, y);

  doc.save(`CourtForwarding_${data.caseData.case_number.replace(/\//g, '-')}.pdf`);
};

export const generateAccusedChallanPDF = (data: any) => {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`IN THE COURT OF ${data.court_name}`, 148, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('ACCUSED CHALLAN', 148, 25, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.caseData.post_name, 148, 32, { align: 'center' });
  doc.text(`DATED-: ${new Date(data.challan_date).toLocaleDateString()}`, 148, 38, { align: 'center' });

  // Table headers
  const headers = ['Sl No', 'Case No with date', 'Name & address of accused', 'Under Section', 'Enclosures', 'Escorting Officers'];
  const colWidths = [15, 35, 80, 30, 70, 45];
  let startX = 10;
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, y - 5, 277, 10, 'F');
  
  let x = startX;
  headers.forEach((header, i) => {
    doc.text(header, x + 2, y + 2);
    x += colWidths[i];
  });

  doc.setFont('helvetica', 'normal');
  y += 12;

  data.accusedList.forEach((accused: any, index: number) => {
    x = startX;
    const rowY = y;
    
    doc.text(`${index + 1}`, x + 5, rowY);
    x += colWidths[0];
    
    doc.text(`${data.caseData.case_number}\nDtd-${new Date(data.caseData.case_date).toLocaleDateString()}`, x + 2, rowY);
    x += colWidths[1];
    
    const accusedInfo = `${accused.full_name}, Mob- ${accused.mobile_number || 'N/A'}, ${accused.gender}-${accused.age} Yrs, S/O- ${accused.father_name} of ${accused.address_line1}, Dist- ${accused.district}(${accused.state})`;
    const accusedLines = doc.splitTextToSize(accusedInfo, colWidths[2] - 4);
    doc.text(accusedLines, x + 2, rowY);
    x += colWidths[2];
    
    doc.text(`${data.caseData.section_of_law}\nRailway Act`, x + 2, rowY);
    x += colWidths[3];
    
    doc.text('(i)Court Forwarding-01\n(ii)Arrest Memo-01\n(iii)Personal Search-01\n(iv)Check List-01\n(v)Medical Memo-01', x + 2, rowY);
    x += colWidths[4];
    
    const escorting = data.escorting_officers || '';
    const escortLines = doc.splitTextToSize(escorting, colWidths[5] - 4);
    doc.text(escortLines, x + 2, rowY);

    y += Math.max(accusedLines.length * 4, 25) + 5;
    doc.line(startX, y - 3, startX + 277, y - 3);
  });

  doc.save(`AccusedChallan_${data.caseData.case_number.replace(/\//g, '-')}.pdf`);
};
