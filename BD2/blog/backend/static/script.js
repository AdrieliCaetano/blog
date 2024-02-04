// Simulação de um banco de dados em formato JSON
const database = {
    posts: [],
    authors: [],
    comments: [],
};

// POSTAGEM

// Enviar dados do post para o servidor
function createPost(title, content, authorRef, imageLink, tags) {
    const postData = {
        titulo: title,
        conteudo: content,
        link_imagem: imageLink,
        autor_REF: authorRef,
        tags: tags, // Adicionado campo tags aqui
        data: new Date().toISOString()
    };

    fetch('/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Post criado com sucesso:', data);
            // Atualiza a lista de posts no frontend
            fetchPosts(); // Esta função busca e renderiza os posts novamente
            document.getElementById('postModal').style.display = 'none';
        })
        .catch(error => {
            console.error('Erro ao criar o post:', error);
        });
}

// Adicionar evento de submissão ao formulário de postagem, se aplicável
const postForm = document.getElementById('postForm');
if (postForm) {
    postForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const imageLink = document.getElementById('postImage').value;
        const authorRef = document.getElementById('postAuthor').value;
        const tags = document.getElementById('postTags').value.split(',').map(tag => tag.trim()); // Extrai as tags do campo de entrada

        createPost(title, content, authorRef, imageLink, tags);
    });
}

function fetchPosts() {
    fetch('/posts')
        .then(response => response.json())
        .then(posts => {
            renderPosts(posts);
        })
        .catch(error => {
            console.error('Erro ao buscar posts:', error);
        });
}

function fetchAndDisplayAuthors() {
    fetch('/usuarios')
        .then(response => response.json())
        .then(authors => {
            const createPostAuthorSelect = document.getElementById('postAuthor');
            const editPostAuthorSelect = document.getElementById('editPostAuthor');
            const authorOptions = authors.map(author =>
                `<option value="${author._id}">${author.nome} ${author.sobrenome}</option>`
            ).join('');

            createPostAuthorSelect.innerHTML = authorOptions;
            editPostAuthorSelect.innerHTML = authorOptions; // Adiciona autores ao modal de edição
        })
        .catch(error => {
            console.error('Erro ao buscar autores:', error);
        });
}

let authorsList = [];

function fetchAndStoreAuthors() {
    fetch('/usuarios')
        .then(response => response.json())
        .then(authors => {
            authorsList = authors.reduce((acc, author) => {
                acc[author._id] = `${author.nome} ${author.sobrenome}`;
                return acc;
            }, {});
            fetchPosts(); // Garante que os posts sejam buscados após os autores estarem disponíveis
        })
        .catch(error => {
            console.error('Erro ao buscar autores:', error);
        });
}

function renderPosts(posts) {
    const postList = document.getElementById('postList'); 
    postList.innerHTML = ''; 

    posts.forEach(post => {
        const authorName = authorsList[post.autor_REF] || 'Autor desconhecido';
        const tags = post.tags ? post.tags.join(', ') : ''; 
        const commentsSection = post.comentarios ? post.comentarios.map(comentario => `
            <div class="comment">
                <button onclick="openEditCommentModal('${post._id}', '${comentario._id}')">Editar</button>
                <button onclick="deleteComment('${post._id}', '${comentario._id}')">Excluir</button>
                <span class="post-date">Postado em: ${new Date(comentario.data).toLocaleString()}</span>
                <span class="post-author">${authorsList[comentario.autor_REF]}</span>
                <p>${comentario.texto}</p>
            </div>
        `).join('') : 'Nenhum comentário ainda.';

        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <h2>${post.titulo}</h2>
                <span class="post-date">${new Date(post.data).toLocaleString()}</span>
            </div>
            <span class="post-author">Por: ${authorName}</span>
            <div class="post-tag">Tags: ${tags}</div>
            <p>${post.conteudo}</p>
            ${post.link_imagem ? `<img src="${post.link_imagem}" alt="Imagem do Post" />` : ''}
            <div class="comments-section">
                ${commentsSection}
            </div>
            <div class="post-buttons">
                <button class="edit-button" onclick="openEditPostModal('${post._id}')">Editar</button>
                <button class="delete-button" onclick="deletePost('${post._id}')">Excluir</button>
                <button class="comment-button" onclick="openCreateCommentModal('${post._id}')">Comentar</button>
            </div>
        `;
        postList.appendChild(postElement);
    });
}

function openEditPostModal(postId) {
    fetch(`/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            document.getElementById('editPostTitle').value = post.titulo;
            document.getElementById('editPostContent').value = post.conteudo;
            document.getElementById('editPostImage').value = post.link_imagem || '';
            document.getElementById('editPostForm').dataset.postId = postId; // Armazena o ID do post no dataset do formulário

            // Abre o modal de edição
            document.getElementById('editPostModal').style.display = 'block';
        })
        .catch(error => console.error('Erro ao buscar os detalhes do post:', error));
}

document.getElementById('closeEditPostModal').addEventListener('click', () => {
    document.getElementById('editPostModal').style.display = 'none';
});

// Atualizar o post
document.getElementById('editPostForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const postId = this.dataset.postId;
    const title = document.getElementById('editPostTitle').value;
    const content = document.getElementById('editPostContent').value;
    const imageLink = document.getElementById('editPostImage').value;
    const authorRef = document.getElementById('editPostAuthor').value;
    const tags = document.getElementById('editPostTags').value.split(',').map(tag => tag.trim()); // Extrai as tags do campo de entrada

    updatePost(postId, title, content, imageLink, authorRef, tags);
});

function deletePost(postId) {
    if (confirm('Tem certeza de que deseja excluir este post?')) {
        fetch('/posts/' + postId, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Post excluído com sucesso:', data);
                fetchPosts(); // Recarrega os posts após a exclusão
            })
            .catch(error => {
                console.error('Erro ao excluir o post:', error);
            });
    }
}

function updatePost(postId, title, content, imageLink, tags) {
    const postData = {
        titulo: title,
        conteudo: content,
        link_imagem: imageLink,
        tags: tags,
    };

    console.log('Atualizando post:', postId, postData);

    fetch('/posts/' + postId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Post atualizado com sucesso:', data);
        document.getElementById('editPostModal').style.display = 'none';
        fetchPosts();
    })
    .catch(error => {
        console.error('Erro ao atualizar o post:', error);
    });
}

// Chame esta função ao carregar a página ou após criar, atualizar ou excluir um post
function fetchPosts() {
    fetch('/posts')
        .then(response => response.json())
        .then(data => {
            renderPosts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar posts:', error);
        });
}

// Inicia a página carregando os posts e autores
document.addEventListener('DOMContentLoaded', (event) => {
    // Fechar o modal de comentários
    let closeCommentModal = document.getElementById('closeCommentModal');
    if(closeCommentModal) {
        closeCommentModal.addEventListener('click', () => {
            document.getElementById('createCommentModal').style.display = 'none';
        });
    } else {
        console.error('Elemento #closeCommentModal não encontrado no DOM');
    }
    fetchPosts();
    fetchAndStoreAuthors();
    fetchAndDisplayAuthors();

    const contentButton = document.getElementById('contentButton');

    if (contentButton) {
        contentButton.addEventListener('click', function() {
            fetchPosts(); // Recarrega as postagens
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// CRIAR COMENTÁRIO

// Função para atualizar um comentário
function updateComment(postId, commentId, newText) {
    const updateData = {
        texto: newText,
    };

    fetch(`/posts/${postId}/comentarios/${commentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Comentário atualizado:', data);
        fetchPosts(); // Atualiza os posts para mostrar o comentário atualizado
        document.getElementById('editCommentModal').style.display = 'none'; // Fecha o modal após a atualização bem-sucedida
    })
    .catch(error => console.error('Erro ao atualizar comentário:', error));
}

document.getElementById('closeEditCommentModal').addEventListener('click', function() {
    document.getElementById('editCommentModal').style.display = 'none';
});

// Ajuste no evento de submissão do formulário de edição de comentário para incluir authorRef
document.getElementById('editCommentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const postId = this.dataset.postId;
    const commentId = this.dataset.commentId;
    const newText = document.getElementById('editCommentText').value;

    // Removendo a referência ao autor na atualização
    updateComment(postId, commentId, newText);
});d

// Função para excluir um comentário
function deleteComment(postId, commentId) {
    if (!confirm('Tem certeza de que deseja excluir este comentário?')) {
        return;
    }
    fetch(`/posts/${postId}/comentarios/${commentId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log('Comentário excluído:', data);
            fetchPosts();
        } else {
            throw new Error(data.error || 'Erro desconhecido ao excluir comentário');
        }
    })
    .catch(error => console.error('Erro ao excluir comentário:', error));
}

function createComment(postId, authorId, commentText) {
    if (!commentText.trim()) {
        alert('Erro: O texto do comentário não pode estar vazio.');
        return;
    }
    const commentData = {
        texto: commentText,
        autor_REF: authorId,
    };
    fetch(`/posts/${postId}/comentarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Comentário criado com sucesso:', data);
        document.getElementById('createCommentModal').style.display = 'none';
        fetchPosts();
    })
    .catch(error => {
        console.error('Erro ao criar o comentário:', error);
    });
}

// Fechar o modal de comentários
document.getElementById('closeCommentModal').addEventListener('click', () => {
    document.getElementById('createCommentModal').style.display = 'none';
});

// Carregar autores para o select do modal de comentários
function loadAuthorsIntoSelect() {
    fetch('/usuarios')
        .then(response => response.json())
        .then(authors => {
            let options = authors.map(author => `<option value="${author._id}">${author.nome} ${author.sobrenome}</option>`).join('');
            document.getElementById('commentAuthor').innerHTML = options;
        })
        .catch(error => {
            console.error('Erro ao carregar autores:', error);
        });
}

function openCreateCommentModal(postId) {
    loadAuthorsIntoSelect();
    document.getElementById('createCommentModal').style.display = 'block';
    document.getElementById('createCommentForm').dataset.postId = postId;
    fetchAndDisplayAuthors();
}

document.getElementById('createCommentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const postId = this.dataset.postId;
    const authorId = document.getElementById('commentAuthor').value;
    const commentText = document.getElementById('commentText').value;
    createComment(postId, authorId, commentText); // Função para criar o comentário
});

function openEditCommentModal(postId, commentId) {
    fetch(`/posts/${postId}/comentarios/${commentId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            return response.json();
        })
        .then(comment => {
            document.getElementById('editCommentText').value = comment.texto;
            // Supondo que você tenha um input oculto ou outro método para armazenar o commentId
            document.getElementById('editCommentForm').dataset.postId = postId; // Armazenando postId
            document.getElementById('editCommentForm').dataset.commentId = commentId; // Armazenando commentId para uso posterior na função de atualização
            document.getElementById('editCommentModal').style.display = 'block';
        })
        .catch(error => console.error('Error fetching comment details:', error));
}

document.getElementById('editCommentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const postId = this.dataset.postId;
    const commentId = this.dataset.commentId;
    const newText = document.getElementById('editCommentText').value;
    const authorRef = document.getElementById('editCommentAuthor').value;

    console.log(`Atualizando comentário para o post: ${postId}, comentário: ${commentId}`); // Para fins de depuração
    updateComment(postId, commentId, newText, authorRef);
});


document.getElementById('closeEditCommentModal').addEventListener('click', () => {
    document.getElementById('editCommentModal').style.display = 'none';
});

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

    // Obtenha os valores do formulário
    const authorData = {
        nome: document.getElementById('authorName').value,
        sobrenome: document.getElementById('authorSurname').value,
        email: document.getElementById('authorEmail').value,
    };

    // Enviar requisição para criar autor (usuário)
    fetch('/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authorData),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Fechar modal e atualizar dropdown de autores, se necessário
            authorModal.style.display = 'none';
            updateAuthorDropdown();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

function updateAuthor(authorId, authorData) {
    fetch('/usuarios/' + authorId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authorData),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Autor atualizado:', data);
            updateAuthorDropdown(); // Atualiza a lista de autores
        })
        .catch(error => console.error('Erro ao atualizar autor:', error));
}

function deleteAuthor(authorId) {
    // Confirmação antes de excluir
    if (confirm('Tem certeza que deseja excluir este autor?')) {
        fetch('/usuarios/' + authorId, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log('Autor excluído:', data);
                renderAuthors(); // Chama a função que renderiza os autores novamente
            })
            .catch(error => console.error('Erro ao excluir autor:', error));
    }
}

function openEditAuthorModal(authorId) {
    fetch('/usuarios/' + authorId)
        .then(response => response.json())
        .then(author => {
            document.getElementById('editAuthorName').value = author.nome;
            document.getElementById('editAuthorSurname').value = author.sobrenome;
            document.getElementById('editAuthorEmail').value = author.email;
            editingAuthorId = authorId;
            document.getElementById('editAuthorModal').style.display = 'block';
            document.getElementById('authorListModal').style.display = 'none';
        })
        .catch(error => console.error('Erro ao buscar autor:', error));
}

// Fechar o modal de edição
const closeEditSpan = document.getElementById('editAuthorModal').getElementsByClassName('close')[0];
closeEditSpan.onclick = function () {
    document.getElementById('editAuthorModal').style.display = 'none';
}

// Adicionar o event listener para atualizar o autor
const editAuthorForm = document.getElementById('editAuthorForm');
editAuthorForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const authorData = {
        nome: document.getElementById('editAuthorName').value,
        sobrenome: document.getElementById('editAuthorSurname').value,
        email: document.getElementById('editAuthorEmail').value,
    };

    // Enviar requisição para atualizar autor
    fetch('/usuarios/' + editingAuthorId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authorData),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Autor atualizado:', data);
            document.getElementById('editAuthorModal').style.display = 'none';
            renderAuthors(); // Atualiza a lista após a edição
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

document.getElementById('showAuthorListButton').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('authorListModal').style.display = 'block';
    renderAuthors(); // Adicione esta linha
});

document.querySelector('#authorListModal .close').addEventListener('click', function () {
    document.getElementById('authorListModal').style.display = 'none';
});

function renderAuthors() {
    const authorList = document.getElementById('authorList');
    authorList.innerHTML = '';

    fetch('/usuarios')
        .then(response => response.json())
        .then(authors => {
            authors.forEach(author => {
                const authorElement = document.createElement('div');
                authorElement.classList.add('author-container');
                authorElement.innerHTML = `
                    <div class="author-details">
                        Nome: ${author.nome} ${author.sobrenome} - Email: ${author.email}
                    </div>
                    <div class="author-actions">
                        <button onclick="deleteAuthor('${author._id}')">Excluir</button>
                        <button onclick="openEditAuthorModal('${author._id}')">Editar</button>
                    </div>
                `;
                authorList.appendChild(authorElement);
            });
            updateAuthorDropdown();
        })
        .catch(error => console.error('Erro ao renderizar autores:', error));
}

renderAuthors();

// BOTÃO DE BUSCA

const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');

function searchPosts(query) {
    const lowerCaseQuery = query.toLowerCase();
    const filteredPosts = database.posts.filter(post =>
        post.titulo.toLowerCase().includes(lowerCaseQuery) ||
        post.conteudo.toLowerCase().includes(lowerCaseQuery) ||
        (post.autor_REF && authorsList[post.autor_REF].toLowerCase().includes(lowerCaseQuery)) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
    );

    renderPosts(filteredPosts);
}

function searchPostsByTags(tags) {
    // Divide a string de tags por vírgula, remove espaços extras e cria parâmetros de consulta
    const tagsArray = tags.split(',').map(tag => tag.trim());
    const params = new URLSearchParams();
    tagsArray.forEach(tag => {
        if (tag) params.append('tag', tag); // Adiciona cada tag como um parâmetro 'tag' separado
    });

    fetch(`/posts/tags?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            renderPosts(posts); // Assume que essa função irá renderizar os posts filtrados corretamente
        })
        .catch(error => {
            console.error('Erro ao buscar posts por tags:', error);
        });
}

// Evento de clique para o botão de busca
searchButton.addEventListener('click', () => {
    searchPostsByTags(searchInput.value);
});

// Evento de tecla 'Enter' para o campo de busca
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchPostsByTags(searchInput.value);
    }
});




// POST MODAL

const postModal = document.getElementById('postModal');
const openPostModal = document.getElementById('openPostModal');
const closePostModal = document.getElementById('closePostModal');
const modalContent = document.querySelector('.modal-content');

// Chame esta função para carregar os autores quando o modal for aberto ou quando a página for carregada
openPostModal.onclick = function () {
    postModal.style.display = 'block';
    fetchAndDisplayAuthors(); // Isso carregará os autores sempre que o modal for aberto
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
