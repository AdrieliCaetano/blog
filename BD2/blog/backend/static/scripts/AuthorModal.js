const authorModal = document.getElementById('authorModal');
const openAuthorModal = document.getElementById('openAuthorModal');

function updateAuthorDropdown() { // Função para atualizar o dropdown de autores
    const authorSelect = document.getElementById('postAuthor');
    authorSelect.innerHTML = database.authors.map(author => 
        `<option value="${author.email}">${author.name} ${author.surname}</option>`
    ).join('');
}


openAuthorModal.onclick = function() {
    authorModal.style.display = 'block';
}

closeSpan.onclick = function() {
    authorModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == authorModal) {
        authorModal.style.display = 'none';
    }
}

authorForm.addEventListener('submit', function(e) { // Evento de submissão do formulário de autor
    e.preventDefault();
    const newAuthor = {
        name: document.getElementById('authorName').value,
        surname: document.getElementById('authorSurname').value,
        email: document.getElementById('authorEmail').value,
        password: document.getElementById('authorPassword').value, // Em uma aplicação real, trate a senha com segurança
    };
    database.authors.push(newAuthor);
    authorModal.style.display = 'none';
    updateAuthorDropdown();
});


