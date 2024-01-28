// Simulação de um banco de dados em formato JSON
const database = {
    posts: [],
    authors: [],
    comments: [],
};

// POSTAGEM

const postForm = document.getElementById('postForm');

function renderPosts(posts = database.posts) {
    const postList = document.getElementById('postList');
    postList.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        const creationDate = new Date(post.date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let postHtml = `
            <div class="post-header">
                <h2>${post.title}</h2>
                <span class="post-date">${creationDate}</span>
            </div>
            <p>Autor: ${post.author}</p>
            ${post.tag ? `<p>Tag: ${post.tag}</p>` : ''}
            <p>${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="${post.title}"/>` : ''}
            <div class="comments">
                ${renderComments(post.id)}
            </div>
        `;
        postElement.innerHTML = postHtml;
        postList.appendChild(postElement);

        // Contêiner para o botão e o formulário de comentários
        const commentContainer = document.createElement('div');
        commentContainer.className = 'comment-container';

        // Botão para mostrar o formulário de comentário
        const addCommentButton = document.createElement('button');
        addCommentButton.textContent = 'Adicionar comentário';
        addCommentButton.className = 'add-comment-button'; // Adicione uma classe para estilização

        // Formulário de comentários, inicialmente oculto
        const commentFormContainer = document.createElement('div');
        commentFormContainer.className = 'comment-form-container';
        commentFormContainer.style.display = 'none';

        // Criação do formulário de comentários
        const commentForm = document.createElement('form');
        commentForm.className = 'comment-form';

        // Campo de texto para o comentário
        const commentInput = document.createElement('input');
        commentInput.type = 'text';
        commentInput.placeholder = 'Adicione um comentário';
        commentInput.required = true;
        commentInput.id = 'comment-' + post.id;

        // Seletor de autores
        const authorSelect = document.createElement('select');
        authorSelect.className = 'author-select'; // Adicione uma classe para estilização
        database.authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.id;
            option.textContent = author.name;
            authorSelect.appendChild(option);
        });

        // Botão de envio para o comentário
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Comentar';
        submitButton.type = 'submit';
        submitButton.className = 'submit-comment-button'; // Adicione uma classe para estilização

        // Adicionando elementos ao formulário de comentários
        commentForm.appendChild(commentInput);
        commentForm.appendChild(authorSelect);
        commentForm.appendChild(submitButton);

        // Adicionando o formulário à div de formulário de comentários
        commentFormContainer.appendChild(commentForm);

        // Adiciona o botão de 'Adicionar comentário' e a div do formulário de comentários ao contêiner
        commentContainer.appendChild(addCommentButton);
        commentContainer.appendChild(commentFormContainer);

        // Adiciona o contêiner de comentários ao elemento de postagem
        postElement.appendChild(commentContainer);

        // Evento de submissão do formulário de comentários
        commentForm.onsubmit = function(e) {
            e.preventDefault();
            addComment(post.id, commentInput.value, authorSelect.value);
            commentInput.value = '';
            commentFormContainer.style.display = 'none'; // Esconde o formulário após o envio
        };

        // Evento de clique para o botão que mostra e esconde o formulário de comentários
        addCommentButton.onclick = function() {
            const isHidden = commentFormContainer.style.display === 'none';
            // Esconde qualquer outro formulário de comentário aberto
            document.querySelectorAll('.post .comment-form-container').forEach(container => {
                container.style.display = 'none';
            });
            // Mostra ou esconde este formulário de comentários
            commentFormContainer.style.display = isHidden ? 'block' : 'none';
        };
    });
}

// Funções relacionadas às postagens
function addPost(title, content, author, image, tag) {
    const newPost = {
        id: Date.now(),
        title,
        content,
        author,
        image,
        tag,
        date: new Date().toISOString()
    };
    database.posts.push(newPost);
    return newPost;
}

// Função modificada para retornar a nova postagem
function addPostAndRender(title, content, authorId, image, tag) {
    // Encontra o autor pelo ID
    const author = database.authors.find(a => a.id === authorId);
    const authorName = author ? `${author.name} ${author.surname}` : 'Autor Desconhecido';

    // Adiciona a nova postagem e retorna
    const newPost = addPost(title, content, authorName, image, tag);
    renderPosts();

    // Limpeza dos campos do formulário
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postAuthor').value = '';
    document.getElementById('postTag').value = '';
    document.getElementById('postImage').value = '';

    return newPost;
}

// Evento de submissão do formulário de postagem
// Evento de submissão do formulário de postagem
postForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtém os valores do formulário
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const postAuthor = document.getElementById('postAuthor').value;
    const postTag = document.getElementById('postTag').value;
    const postImageUrl = document.getElementById('postImage').value; // Agora é uma URL de imagem

    const newPost = addPostAndRender(postTitle, postContent, postAuthor, postImageUrl, postTag);

    // Fecha o modal de postagem
    postModal.style.display = 'none';

    // Cria um ID único para a nova postagem baseado no timestamp
    const postId = `post-${newPost.id}`;
    const postElement = document.createElement('div');
    postElement.id = postId;
    document.getElementById('postList').appendChild(postElement);

    // Desloca a página até a nova postagem
    document.getElementById(postId).scrollIntoView({ behavior: 'smooth' });
});

// CRIAÇÃO DE COMENTÁRIOS

// Função para renderizar comentários
function renderComments(postId) {
    const comments = database.comments.filter(comment => comment.postId === postId);
    return comments.map(comment => {
        // Crie um objeto Date com a data do comentário
        const date = new Date(comment.date);
        // Formate a data e a hora no formato desejado
        const formattedDate = date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `;
    }).join('');
}


// Função para adicionar um comentário
function addComment(postId, commentText, authorId) {
    // Encontra o autor pelo ID
    const author = database.authors.find(a => a.id === authorId);
    const authorName = author ? `${author.name} ${author.surname}` : 'Autor Desconhecido';

    const newComment = {
        id: Date.now(), // Usando o timestamp como ID temporário
        text: commentText,
        date: new Date().toISOString(),
        author: authorName, // Agora usamos o nome do autor
        postId: postId
    };

    database.comments.push(newComment);
    renderPosts(); // Re-renderiza as postagens para mostrar o novo comentário
}

// CRIAÇÃO DE AUTOR

const closeSpan = document.getElementsByClassName('close')[0];
const authorForm = document.getElementById('authorForm');

function updateAuthorDropdown() {
    const authorSelect = document.getElementById('postAuthor');
    authorSelect.innerHTML = database.authors.map(author =>
        `<option value="${author.id}">${author.name} ${author.surname}</option>`
    ).join('');
}


authorForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Gera um ID único para o novo autor. Este é apenas um exemplo e pode ser substituído
    // por qualquer método de geração de ID que você prefira.
    const newAuthorId = Date.now().toString();

    const newAuthor = {
        id: newAuthorId, // Certifique-se de que este campo 'id' seja adicionado
        name: document.getElementById('authorName').value,
        surname: document.getElementById('authorSurname').value,
        email: document.getElementById('authorEmail').value,
    };

    database.authors.push(newAuthor);
    authorModal.style.display = 'none';
    updateAuthorDropdown();
});

// BOTÃO DE BUSCA

const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');

// Funções de busca
function searchPosts(query) {
    const lowerCaseQuery = query.toLowerCase();
    const filteredPosts = database.posts.filter(post =>
        post.title.toLowerCase().includes(lowerCaseQuery) ||
        post.content.toLowerCase().includes(lowerCaseQuery) ||
        post.author.toLowerCase().includes(lowerCaseQuery) ||
        (post.tag && post.tag.toLowerCase().includes(lowerCaseQuery))
    );

    renderPosts(filteredPosts);

    // Rolar para os resultados da busca
    const postList = document.getElementById('postList');
    if (postList) {
        postList.scrollIntoView({ behavior: 'smooth' });
    }
}

searchButton.addEventListener('click', () => {
    searchPosts(searchInput.value);
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchPosts(searchInput.value);
    }
});

// POST MODAL

// Parte do script relacionada ao modal de postagem
const postModal = document.getElementById('postModal');
const openPostModal = document.getElementById('openPostModal');
const closePostModal = document.getElementById('closePostModal');
const modalContent = document.querySelector('.modal-content'); // Adicione uma classe ao conteúdo do seu modal

openPostModal.onclick = function () {
    postModal.style.display = 'block';
};

closePostModal.onclick = function () {
    postModal.style.display = 'none';
};

// Função para fechar o modal se o clique for fora do conteúdo do modal
window.onclick = function (event) {
    if (event.target == postModal) {
        postModal.style.display = 'none';
    } else if (event.target == authorModal) {
        authorModal.style.display = 'none';
    }
};

// AUTHOR MODAL

const authorModal = document.getElementById('authorModal');
const openAuthorModal = document.getElementById('openAuthorModal');

openAuthorModal.onclick = function () {
    authorModal.style.display = 'block';
}

closeSpan.onclick = function () {
    authorModal.style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == authorModal) {
        authorModal.style.display = 'none';
    }
}

// Inicialização da página
updateAuthorDropdown();
renderPosts();
