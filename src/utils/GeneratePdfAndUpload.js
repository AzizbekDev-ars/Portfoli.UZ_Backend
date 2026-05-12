import puppeteer from "puppeteer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const generatePdfAndUpload = async (cv) => {
    const design = cv.design || 'modern';
    
    // Dizayn sozlamalari (Frontenddagidek)
    let theme = {
        bgColor: '#f3f4f6',
        containerBg: 'white',
        leftBg: '#1e293b',
        leftText: '#cbd5e1',
        rightBg: 'white',
        nameColor: '#0f172a',
        accentColor: '#4f46e5',
        sectionTitleColor: '#4f46e5',
        itemBorder: 'border-l-2 border-indigo-200',
        fontFamily: "'Inter', sans-serif"
    };

    if (design === 'creative') {
        theme = {
            bgColor: '#fff7ed',
            containerBg: 'white',
            leftBg: 'linear-gradient(to bottom, #c026d3, #f97316)',
            leftText: 'white',
            rightBg: '#fff7ed33',
            nameColor: '#c026d3',
            accentColor: '#f97316',
            sectionTitleColor: '#f97316',
            itemBorder: 'bg-white rounded-xl shadow-sm border border-orange-100 p-4',
            fontFamily: "'Inter', sans-serif"
        };
    } else if (design === 'formal') {
        theme = {
            bgColor: 'white',
            containerBg: 'white',
            leftBg: '#f1f5f9',
            leftText: '#334155',
            rightBg: 'white',
            nameColor: '#0f172a',
            accentColor: '#0f172a',
            sectionTitleColor: '#334155',
            itemBorder: 'border-l-2 border-slate-300',
            fontFamily: "'Inter', sans-serif"
        };
    } else if (design === 'ultra-formal') {
        theme = {
            bgColor: 'white',
            containerBg: 'white',
            leftBg: 'white',
            leftText: 'black',
            rightBg: 'white',
            nameColor: 'black',
            accentColor: 'black',
            sectionTitleColor: 'black',
            itemBorder: 'border-l-4 border-black',
            fontFamily: "'Times New Roman', serif"
        };
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: ${theme.fontFamily};
}

body {
    width: 210mm;
    height: 297mm;
    background: ${theme.bgColor};
}

.container {
    width: 210mm;
    height: 297mm;
    background: ${theme.containerBg};
    display: flex;
    overflow: hidden;
}

/* LEFT SIDE */
.left {
    width: 35%;
    padding: 40px 25px;
    background: ${theme.leftBg};
    color: ${theme.leftText};
    ${design === 'ultra-formal' ? 'border-right: 2px solid black;' : ''}
}

.avatar {
    width: 150px;
    height: 150px;
    object-fit: cover;
    margin: 0 auto 30px;
    display: block;
    ${design === 'ultra-formal' ? 'filter: grayscale(100%); border: 4px solid black;' : 'border-radius: 50%; border: 4px solid white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);'}
}

.left-section {
    margin-bottom: 30px;
}

.left-title {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: ${design === 'ultra-formal' ? '2px solid black' : '1px solid rgba(255,255,255,0.2)'};
    ${design === 'formal' ? 'border-bottom-color: #cbd5e1; color: #0f172a;' : ''}
    ${design === 'ultra-formal' ? 'color: black;' : ''}
}

.contact-item {
    margin-bottom: 12px;
    font-size: 12px;
}

.contact-label {
    font-size: 10px;
    text-transform: uppercase;
    opacity: 0.7;
    display: block;
    font-weight: 700;
}

.cert-item {
    margin-bottom: 15px;
}

.cert-title {
    font-weight: 700;
    font-size: 12px;
    margin-bottom: 2px;
}

.cert-provider {
    font-size: 11px;
    opacity: 0.8;
}

/* RIGHT SIDE */
.right {
    width: 65%;
    padding: 50px 40px;
    background: ${theme.rightBg};
}

.name {
    font-size: 42px;
    font-weight: 900;
    color: ${theme.nameColor};
    line-height: 1;
    margin-bottom: 8px;
    ${design === 'ultra-formal' ? 'text-transform: uppercase; letter-spacing: 2px; border-bottom: 4px solid black; padding-bottom: 10px;' : ''}
}

.job {
    font-size: 18px;
    font-weight: 600;
    color: ${theme.accentColor};
    margin-bottom: 40px;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.section {
    margin-bottom: 35px;
}

.section-title {
    font-size: 18px;
    font-weight: 900;
    color: ${theme.sectionTitleColor};
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}

${design === 'modern' ? '.section-title::before { content: ""; display: block; width: 25px; height: 4px; background: #4f46e5; }' : ''}
${design === 'creative' ? '.section-title { background: #ffedd5; padding: 5px 15px; border-radius: 8px; display: inline-block; }' : ''}
${design === 'ultra-formal' ? '.section-title { border-bottom: 2px solid black; display: inline-block; padding-bottom: 2px; }' : ''}

.profile-text {
    font-size: 13px;
    line-height: 1.6;
    color: #475569;
    text-align: justify;
}

.item {
    margin-bottom: 20px;
    padding-left: 20px;
    ${theme.itemBorder};
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 5px;
}

.item-title {
    font-size: 16px;
    font-weight: 700;
    color: ${theme.nameColor};
}

.item-date {
    font-size: 11px;
    font-weight: 700;
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 4px;
    color: #64748b;
    ${design === 'ultra-formal' ? 'background: none; border: 1px solid black; color: black;' : ''}
}

.item-subtitle {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
    ${design === 'ultra-formal' ? 'color: black;' : ''}
}

.item-desc {
    font-size: 12.5px;
    line-height: 1.5;
    color: #475569;
}

</style>
</head>
<body>
<div class="container">
    <div class="left">
        ${cv.image ? `<img src="${cv.image}" class="avatar" />` : `<div style="height: 150px;"></div>`}
        
        <div class="left-section">
            <div class="left-title">Bog'lanish</div>
            ${(cv.Contact || []).map(c => `
                <div class="contact-item">
                    <span class="contact-label">${c.type}</span>
                    <span>${c.link}</span>
                </div>
            `).join("")}
            <div class="contact-item">
                <span class="contact-label">Manzil</span>
                <span>${cv.address || 'N/A'}</span>
            </div>
        </div>

        ${cv.Certificates?.length ? `
            <div class="left-section">
                <div class="left-title">Sertifikatlar</div>
                ${cv.Certificates.map(cert => `
                    <div class="cert-item">
                        <div class="cert-title">${cert.title}</div>
                        <div class="cert-provider">${cert.provider}</div>
                        <div style="font-size: 10px; opacity: 0.6;">${cert.date}</div>
                    </div>
                `).join("")}
            </div>
        ` : ''}

        ${cv.Skills?.Frontend?.length ? `
            <div class="left-section">
                <div class="left-title">Ko'nikmalar</div>
                <div style="font-size: 12px; line-height: 1.6;">
                    ${cv.Skills.Frontend.join(", ")}
                </div>
            </div>
        ` : ''}
    </div>

    <div class="right">
        <div class="name">${cv.Title?.name || ''} ${cv.Title?.surename || ''}</div>
        <div class="job">${cv.Title?.job || ''}</div>

        <div class="section">
            <div class="section-title">Profil</div>
            <div class="profile-text">${cv.Profile || 'Hali bio kiritilmagan.'}</div>
        </div>

        ${cv.Experience?.length ? `
            <div class="section">
                <div class="section-title">Ish Tajribasi</div>
                ${cv.Experience.map(exp => `
                    <div class="item">
                        <div class="item-header">
                            <div class="item-title">${exp.jobType}</div>
                            <div class="item-date">${exp.jobPeriod?.start} - ${exp.jobPeriod?.end}</div>
                        </div>
                        <div class="item-subtitle">${exp.company}</div>
                        <div class="item-desc">${exp.description}</div>
                    </div>
                `).join("")}
            </div>
        ` : ''}

        ${cv.Projects?.length ? `
            <div class="section">
                <div class="section-title">Loyihalar</div>
                ${cv.Projects.map(proj => `
                    <div class="item">
                        <div class="item-header">
                            <div class="item-title">${proj.projectname}</div>
                        </div>
                        <div class="item-desc">${proj.description}</div>
                    </div>
                `).join("")}
            </div>
        ` : ''}
    </div>
</div>
</body>
</html>
    `;

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, {waitUntil: "networkidle0"});

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: "raw",
            folder: "CV_pdfs",
            public_id: `pdf_${cv._id}.pdf`
        },
        (error, result) => {
            if(error) return reject(error);
            resolve({ result, pdfBuffer });
        }   
        );
        streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    })
}
