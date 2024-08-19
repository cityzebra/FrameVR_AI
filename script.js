function sendQuestion()
{
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();

    if (question === '') return;

    // Add the user's question to the chat
    addMessageToChat(question, 'user');

    // Clear the input field
    questionInput.value = '';

    // Get the document content
    const documentContent = document.getElementById('document-content').value.trim();

    // Perform the API request without needing the API key from the client-side
    fetch('http://localhost:5000/api/query',
        {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
            {
                documentContext: documentContent,
                question: question
            }
            )
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                addMessageToChat(`Error: ${data.error}`, 'bot');
            } else {
                const answer = data.choices[0].message.content;
                addMessageToChat(answer, 'bot');
            }
        })
        .catch(error => {
            addMessageToChat(`Error: ${error.message}`, 'bot');
        });
}

function addMessageToChat(message, sender) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function uploadPDF() {
    const pdfFile = document.getElementById('pdf-file').files[0];

    if (!pdfFile) {
        alert('Please select a PDF file to upload.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const typedArray = new Uint8Array(event.target.result);

        // Load the PDF using pdfjsLib
        pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
            let pdfText = '';

            // Fetch each page and extract the text
            const numPages = pdf.numPages;
            const promises = [];

            for (let i = 1; i <= numPages; i++) {
                promises.push(pdf.getPage(i).then(function (page) {
                    return page.getTextContent().then(function (textContent) {
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        pdfText += pageText + '\n';
                    });
                }));
            }

            Promise.all(promises).then(function () {
                // Display the extracted text in the textarea
                document.getElementById('document-content').value = pdfText;
            });
        });
    };

    reader.readAsArrayBuffer(pdfFile);
}
// Add event listener for Enter key on the question input field
document.getElementById('question-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter behavior
        sendQuestion(); // Trigger question submission
    }
});