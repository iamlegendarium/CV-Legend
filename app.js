async function callGroq(prompt, systemPrompt = "") {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch("http://localhost:3000/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 2000,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Server error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

// TAB SWITCHING
function switchTab(name) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  event.target.classList.add("active");
  document.getElementById("panel-" + name).classList.add("active");
}

// GENERATE CV
async function generateCV() {
  const name = v("g-name"),
    role = v("g-role"),
    email = v("g-email"),
    contact = v("g-contact"),
    address = v("g-address"),
    links = v("g-links"),
    summary = v("g-summary"),
    target = v("g-target"),
    exp = v("g-experience"),
    edu = v("g-education"),
    skills = v("g-skills");

  if (!name || !exp) {
    alert("Please fill in at least your name and work experience.");
    return;
  }

  show("gen-loader");
  hide("gen-output");

  const prompt = `Write a professional UK-format CV for ${name} that sounds completely human-written.

PERSONAL DETAILS:
Name: ${name}
Current Role: ${role || "Professional"}
Email: ${email || "[email]"}
Phone: ${contact || "[phone]"}
Address: ${address || "[address]"}
LinkedIn/Portfolio: ${links || "[links]"}

EXPERIENCE:
${exp}

EDUCATION:
${edu || "Not specified"}

SKILLS:
${skills || "Not specified"}

TARGET ROLE:
${target || "Not specified"}

SUMMARY HIGHLIGHTS:
${summary || "Not specified"}

NEVER USE THESE AI PHRASES:
- "Leveraged my skills"
- "Proven track record"
- "Results-driven"
- "Passionate about"
- "Team player"
- "Detail-oriented"
- "Think outside the box"
- "Synergy"
- "Best in class"
- "Dynamic environment"
- "Fast-paced"
- "Demonstrated ability"
- "Proven success"

DO USE NATURAL PHRASES LIKE:
- "I managed"
- "My team"
- "We built"
- "Got promoted"
- "Figured out"
- "Handled"
- "Fixed"
- "Learned"
- "Taught others"
- "Made mistakes and fixed them"

UK CV FORMAT REQUIREMENTS:
1. Start with PERSONAL DETAILS: Name, Address, Phone, Email (in that order)
2. Next section: PROFESSIONAL SUMMARY (2-4 sentences, no clichés)
3. Then: WORK EXPERIENCE (most recent first, include company, role, dates)
4. Then: EDUCATION (most recent first, include institutions, dates, qualifications)
5. Finally: SKILLS (as a simple list)

WRITING STYLE:
- Write like you're telling a story to a colleague at a pub
- Use short, punchy sentences
- Vary how you start each bullet
- Include specific numbers: "grew by 40%", "cut costs by £50k"
- Show personality and real experience
- Use UK spelling (organisation not organization, labour not labor)

Format the CV in clean plain text with clear section headers in ALL CAPS.`;

  try {
    const systemPrompt = `You're a UK career coach who writes CVs that get interviews. You write like a real person, not a robot. You know UK CV standards perfectly.`;

    const result = await callGroq(prompt, systemPrompt);
    document.getElementById("gen-cv-text").textContent = result;
    show("gen-output");
  } catch (e) {
    alert("API error: " + e.message);
  }
  hide("gen-loader");
}

// TAILOR CV
async function tailorCV() {
  const cv = v("t-cv"),
    jd = v("t-jd");
  if (!cv || !jd) {
    alert("Please paste both your CV and the job description.");
    return;
  }
  show("tailor-loader");
  hide("tailor-output");

  const prompt = `Rewrite this CV to match this job description perfectly, but make it sound 100% human and follow UK format.

JOB DESCRIPTION:
${jd}

CURRENT CV:
${cv}

STRATEGY:
1. Extract EVERY keyword and phrase from the job description
2. Mirror their EXACT language - if they say "oversaw", use "oversaw" not "managed"
3. Keep all facts true - don't invent experience
4. Reword existing experience to use their terminology
5. Remove or shorten irrelevant experience
6. Add a summary that uses their exact phrases

UK FORMAT REQUIREMENTS:
- Personal details at top (Name, Address, Phone, Email)
- Professional summary next (2-4 sentences)
- Work experience in reverse chronological order
- Education in reverse chronological order
- Skills as a simple list

AVOID THESE AT ALL COSTS:
- "I'm passionate about"
- "Thrive in fast-paced"
- "Team player"
- "Excellent communication"
- "Proven ability"
- "Demonstrated success"
- "Leveraged"
- "Synergized"

WRITE LIKE THIS INSTEAD:
- "I ran" (not "I was responsible for running")
- "We grew" (not "I helped grow")
- "Got promoted to" (not "I advanced to")
- Short sentences
- Real numbers: "grew by 40%", "managed £2M"
- Varied sentence starters
- UK spelling

Output the complete tailored CV in plain text. Section headers in ALL CAPS.`;

  try {
    const result = await callGroq(prompt);
    document.getElementById("tailor-cv-text").textContent = result;
    show("tailor-output");
  } catch (e) {
    alert("API error: " + e.message);
  }
  hide("tailor-loader");
}

// SCORE CV
async function scoreCV() {
  const cv = v("s-cv"),
    jd = v("s-jd");
  if (!cv || !jd) {
    alert("Please paste both your CV and the job description.");
    return;
  }
  show("score-loader");
  hide("score-output");

  const prompt = `Analyse the match between this CV and job description. Respond ONLY with valid JSON.

CV:
${cv}

JOB DESCRIPTION:
${jd}

Return this EXACT JSON format:
{
  "overall": 72,
  "breakdown": {
    "keywords": 65,
    "experience": 78,
    "skills": 70,
    "format": 80
  },
  "keywords_found": ["keyword1", "keyword2", "keyword3"],
  "keywords_missing": ["keyword4", "keyword5", "keyword6"],
  "analysis": "Write 3-4 sentences of honest feedback. Mention specific missing keywords and suggest how to add them naturally. Consider UK CV standards."
}`;

  try {
    const raw = await callGroq(
      prompt,
      "You are a CV analyst. Return ONLY valid JSON, no other text.",
    );
    const clean = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    document.getElementById("score-number").textContent = data.overall + "%";
    const color =
      data.overall >= 75
        ? "var(--sage)"
        : data.overall >= 50
          ? "var(--gold)"
          : "var(--rust)";
    document.getElementById("score-number").style.color = color;

    const bd = document.getElementById("score-breakdown");
    bd.innerHTML = Object.entries(data.breakdown)
      .map(
        ([k, v]) =>
          `<div class="score-item"><div class="score-item-num" style="color:${color}">${v}%</div><div class="score-item-lbl">${k}</div></div>`,
      )
      .join("");

    document.getElementById("kw-found").innerHTML = data.keywords_found
      .map((k) => `<span class="kw present">✓ ${k}</span>`)
      .join("");
    document.getElementById("kw-missing").innerHTML = data.keywords_missing
      .map((k) => `<span class="kw missing">✗ ${k}</span>`)
      .join("");

    document.getElementById("score-analysis").textContent = data.analysis;
    show("score-output");
  } catch (e) {
    alert("Analysis error. Please try again.");
    console.error(e);
  }
  hide("score-loader");
}

// REWRITE BULLETS
async function rewriteBullets() {
  const bullets = v("r-bullets");
  if (!bullets) {
    alert("Please paste your bullet points.");
    return;
  }
  show("rewrite-loader");
  hide("rewrite-output");

  const prompt = `Make these CV bullet points powerful but human-sounding, suitable for a UK CV.

ORIGINAL BULLETS:
${bullets}

ROLE CONTEXT: ${v("r-role") || "Not specified"}
ACTUAL METRICS: ${v("r-metrics") || "None provided"}

NEVER USE:
- "Responsible for"
- "Tasked with"
- "Helped to"
- "In charge of"
- "Worked on"
- "Participated in"
- "Assisted with"
- "Supported"

USE INSTEAD:
- "Led" (not "was the leader of")
- "Built" (not "was involved in building")
- "Grew" (not "helped grow")
- "Cut" (not "reduced")
- "Launched" (not "was part of the launch")
- "Fixed" (not "helped fix")
- "Saved" (not "helped save")

RULES:
- Start each bullet with a strong verb
- Include real numbers: "grew by 40%", "managed £2M"
- Vary sentence structure
- Make each bullet tell a mini-story
- Sound like a person, not a corporate brochure
- Use UK spelling

Output ONLY the rewritten bullets, one per line, each starting with •`;

  try {
    const result = await callGroq(
      prompt,
      "You write CV bullets that get interviews because they sound human. No corporate speak.",
    );
    document.getElementById("rewrite-before").textContent = bullets;
    document.getElementById("rewrite-result").textContent = result;
    show("rewrite-output");
  } catch (e) {
    alert("API error: " + e.message);
  }
  hide("rewrite-loader");
}

//  DOWNLOAD FUNCTIONS

// Download as DOCX (Microsoft Word format)
async function downloadDoc(id, filename) {
  const text = document.getElementById(id).textContent;

  try {
    // Create a Blob with proper formatting for Word
    const htmlContent = `
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <title>CV - ${filename}</title>
        <style>
          body { 
            font-family: 'Calibri', 'Arial', sans-serif; 
            font-size: 11pt; 
            line-height: 1.4;
            max-width: 800px;
            margin: 2.5cm auto;
            padding: 0 20px;
            color: #000000;
          }
          h1 { 
            font-size: 24pt; 
            font-weight: bold; 
            margin-bottom: 5px;
            color: #000000;
            border-bottom: 2px solid #333333;
            padding-bottom: 10px;
          }
          h2 { 
            font-size: 14pt; 
            font-weight: bold; 
            margin-top: 20px; 
            margin-bottom: 10px;
            background-color: #f0f0f0;
            padding: 5px 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .contact-info {
            margin-bottom: 20px;
            line-height: 1.6;
            color: #444444;
          }
          .section {
            margin-bottom: 20px;
          }
          .job-title {
            font-weight: bold;
            color: #000000;
          }
          .date {
            color: #666666;
            font-style: italic;
          }
          ul {
            margin-top: 5px;
            margin-bottom: 15px;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          hr {
            border: none;
            border-top: 1px dashed #cccccc;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        ${formatTextForWord(text)}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    saveAs(blob, filename.replace(".doc", ".doc"));
  } catch (error) {
    console.error("DOC download error:", error);
    alert("Error creating DOC file. Downloading as TXT instead.");
    downloadTxt(id, filename.replace(".doc", ".txt"));
  }
}

// Helper function to format plain text for Word HTML
function formatTextForWord(text) {
  let html = "";
  const lines = text.split("\n");
  let inList = false;

  lines.forEach((line) => {
    line = line.trim();
    if (!line) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += "<br>";
      return;
    }

    // Check if it's a header (ALL CAPS line)
    if (line === line.toUpperCase() && line.length > 3 && !line.includes("@")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h2>${line}</h2>`;
    }
    // Check if it's contact info (contains email, phone, address patterns)
    else if (
      line.includes("@") ||
      line.match(/\d{5,}/) ||
      line.includes("www.") ||
      line.includes(".com")
    ) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<div class="contact-info">${line}</div>`;
    }
    // Check if it's a bullet point
    else if (
      line.startsWith("•") ||
      line.startsWith("-") ||
      line.startsWith("*")
    ) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${line.substring(1).trim()}</li>`;
    }
    // Regular paragraph
    else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      // Check if it might be a job title (contains company/role patterns)
      if (
        line.includes("@") ||
        line.includes("|") ||
        line.match(/^[A-Z][a-z]+ [A-Z][a-z]+/)
      ) {
        html += `<div class="job-title">${line}</div>`;
      } else {
        html += `<p>${line}</p>`;
      }
    }
  });

  if (inList) {
    html += "</ul>";
  }

  return html;
}

// Download as TXT
function downloadTxt(id, filename) {
  const text = document.getElementById(id).textContent;
  const blob = new Blob([text], { type: "text/plain" });
  saveAs(blob, filename);
}

// Download as PDF
async function downloadPDF(id) {
  const { jsPDF } = window.jspdf;
  const text = document.getElementById(id).textContent;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Split text into lines
  const lines = doc.splitTextToSize(text, 175);
  const pageHeight = 280;
  let y = 15;

  doc.setFont("helvetica");
  doc.setFontSize(9);

  lines.forEach((line) => {
    if (y > pageHeight) {
      doc.addPage();
      y = 15;
    }

    // Check if it's a header (ALL CAPS line)
    const isHeader =
      line === line.toUpperCase() &&
      line.trim().length > 3 &&
      !line.includes("@");

    if (isHeader) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    }

    doc.text(line, 15, y);
    y += isHeader ? 7 : 5;
  });

  doc.save("cv.pdf");
}

// UTILITIES
function v(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function show(id) {
  const el = document.getElementById(id);
  el.style.display = "";
  if (el.classList.contains("loader")) el.classList.add("active");
}

function hide(id) {
  const el = document.getElementById(id);
  if (el.classList.contains("loader")) el.classList.remove("active");
  else el.style.display = "none";
}

function copyToTailor() {
  const text = document.getElementById("gen-cv-text").textContent;
  document.getElementById("t-cv").value = text;
  switchTabDirect("tailor");
}

function switchTabDirect(name) {
  document.querySelectorAll(".tab").forEach((t, i) => {
    t.classList.toggle(
      "active",
      ["generate", "tailor", "score", "rewrite"][i] === name,
    );
  });
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("panel-" + name).classList.add("active");
}

function copyText(id) {
  navigator.clipboard.writeText(document.getElementById(id).textContent);
}
