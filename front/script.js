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
        const date = new Date(post.date);
        const formattedDate = date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        const formattedTime = date.toLocaleString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let postHtml = `
            <div class="post-header">
                <h2>${post.title}</h2>
                <span class="post-date">${formattedDate} (${formattedTime})</span>
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
        addCommentButton.className = 'add-comment-button';

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
        authorSelect.className = 'author-select';
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
        submitButton.className = 'submit-comment-button';

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
            commentFormContainer.style.display = 'none';
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

function addPostAndRender(title, content, authorId, image, tag) {

    const author = database.authors.find(a => a.id === authorId);
    const authorName = author ? `${author.name} ${author.surname}` : 'Autor Desconhecido';
    const newPost = addPost(title, content, authorName, image, tag);
    renderPosts();

    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postAuthor').value = '';
    document.getElementById('postTag').value = '';
    document.getElementById('postImage').value = '';

    return newPost;
}

postForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const postAuthor = document.getElementById('postAuthor').value;
    const postTag = document.getElementById('postTag').value;
    const postImageUrl = document.getElementById('postImage').value;

    const newPost = addPostAndRender(postTitle, postContent, postAuthor, postImageUrl, postTag);

    postModal.style.display = 'none';

    const postId = `post-${newPost.id}`;
    const postElement = document.createElement('div');
    postElement.id = postId;
    document.getElementById('postList').appendChild(postElement);
    document.getElementById(postId).scrollIntoView({ behavior: 'smooth' });
});

// CRIAÇÃO DE COMENTÁRIOS

function renderComments(postId) {
    const comments = database.comments.filter(comment => comment.postId === postId);
    return comments.map(comment => {

        const commentDate = new Date(comment.date);
        const formattedCommentDate = commentDate.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        const formattedCommentTime = commentDate.toLocaleString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const fullCommentDate = `${formattedCommentDate} (${formattedCommentTime})`;

        return `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${fullCommentDate}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `;
    }).join('');
}

function addComment(postId, commentText, authorId) {

    const author = database.authors.find(a => a.id === authorId);
    const authorName = author ? `${author.name} ${author.surname}` : 'Autor Desconhecido';

    const newComment = {
        id: Date.now(),
        text: commentText,
        date: new Date().toISOString(),
        author: authorName,
        postId: postId
    };

    database.comments.push(newComment);
    renderPosts();
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

    const newAuthorId = Date.now().toString();
    const newAuthor = {
        id: newAuthorId,
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

function searchPosts(query) {
    const lowerCaseQuery = query.toLowerCase();
    const filteredPosts = database.posts.filter(post =>
        post.title.toLowerCase().includes(lowerCaseQuery) ||
        post.content.toLowerCase().includes(lowerCaseQuery) ||
        post.author.toLowerCase().includes(lowerCaseQuery) ||
        (post.tag && post.tag.toLowerCase().includes(lowerCaseQuery))
    );

    renderPosts(filteredPosts);

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

const postModal = document.getElementById('postModal');
const openPostModal = document.getElementById('openPostModal');
const closePostModal = document.getElementById('closePostModal');
const modalContent = document.querySelector('.modal-content');

openPostModal.onclick = function () {
    postModal.style.display = 'block';
};

closePostModal.onclick = function () {
    postModal.style.display = 'none';
};

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
