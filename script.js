let documents = [];

function handleFileUpload(event) {
    const file = event.target.files[0];
    const fileType = file.type;

    if (fileType === "application/pdf") {
        extractTextFromPDF(file);
    } else if (fileType === "text/plain") {
        readTextFile(file);
    } else {
        alert("Unsupported file type. Please upload a PDF or plain text file.");
    }
}

function readTextFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        documents.push(e.target.result);
        document.getElementById('documentContent').value += `\n${e.target.result}`;
    };
    reader.readAsText(file);
}

function extractTextFromPDF(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const typedArray = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
            let textPromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                textPromises.push(pdf.getPage(i).then(function (page) {
                    return page.getTextContent().then(function (textContent) {
                        return textContent.items.map(item => item.str).join(" ");
                    });
                }));
            }
            Promise.all(textPromises).then(function (pagesText) {
                const fullText = pagesText.join("\n");
                documents.push(fullText);
                document.getElementById('documentContent').value += `\n${fullText}`;
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

function addDocumentContent() {
    const content = document.getElementById('documentContent').value;
    if (content) {
        documents.push(content);
    }
}

function findMostRelevantDocument(question) {
    // Simple matching for demo purposes. Implement a more advanced algorithm if needed.
    for (let doc of documents) {
        if (doc.includes(question)) {
            return doc;
        }
    }
    return documents.length > 0 ? documents[0] : "No relevant document found.";
}

async function handleUserQuestion(question) {
    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) {
        alert("Please enter your OpenAI API key.");
        return;
    }

    addDocumentContent();

    const relevantDocument = findMostRelevantDocument(question);

    const requestBody = {
        model: "gpt-4o",  // Use the appropriate model name
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `User asked: ${question}\nDocument says: ${relevantDocument}\nAnswer:` }
        ],
        max_tokens: 150
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${errorText}`);
        }

        const data = await response.json();
        document.getElementById('answerText').innerText = data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('answerText').innerText = `Error: ${error.message}`;
    }
}

function submitQuestion() {
    const question = document.getElementById('userQuestion').value;
    handleUserQuestion(question);
}
