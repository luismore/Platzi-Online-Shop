window.onload = () =>{
    getCarro();
    loadCategories();
    loadProducts();
}





const productsContainer = document.getElementById('products');
const loadMoreButton = document.getElementById('load-more');
const cartItems = document.getElementById('cart-items');
const categoriesNav = document.getElementById('categories');

const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCartButton = document.getElementById('close-cart');
const productModal = document.getElementById('product-modal');
const closeProductModalButton = document.getElementById('close-product-modal');

let offset =0;
let limit = 10;
let cart = [];


// Función para cargar productos
function loadProducts(categoryId = null) {
    let url = categoryId
        ? 'https://api.escuelajs.co/api/v1/categories/' + categoryId + '/products?offset=' + offset + '&limit=' + limit
        : 'https://api.escuelajs.co/api/v1/products?offset=' + offset + '&limit=' + limit;

    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(products) {
            if (products.length === 0) {
                console.warn('No se encontraron productos.');
                return;
            }
            products.forEach(function(product) {
                const productCard = document.createElement('div');
                productCard.classList.add('product');
                
                let productContent = '';
                productContent += '<img src="' + product.images[0] + '" alt="' + product.title + '">';
                productContent += '<h3>' + product.title + '</h3>';
                productContent += '<p>' + product.price + ' USD</p>';
                productContent += '<button data-id="' + product.id + '">Agregar al carrito</button>';
                productContent += '<button data-id="' + product.id + '" class="verDetalles">Ver Detalles</button>';

                productCard.innerHTML = productContent;
                productsContainer.appendChild(productCard);
            });

            offset += limit;
        })
}


// Función para cargar categorías
function loadCategories() {
    fetch('https://api.escuelajs.co/api/v1/categories')
        .then(function(response) {
            return response.json();
        })
        .then(function(categories) {
            for (let i = 0; i < categories.length && i < 4; i++) {
                const category = categories[i];
                const categoryButton = document.createElement('button');
                categoryButton.textContent = category.name;
                categoryButton.setAttribute('data-id', category.id);
                categoryButton.classList.add('category-button');

                categoryButton.addEventListener('click', function() {
                    productsContainer.innerHTML = ''; 
                    offset = 0;
                    loadProducts(category.id); 
                });

                categoriesNav.appendChild(categoryButton);
            }
        });
}


// Agregar al carrito
function addCarrito(idProducto) {
    let encontrado = false;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === parseInt(idProducto)) {
            let cantidadParseado = parseInt(cart[i].quantity);
            cantidadParseado++;
            cart[i].quantity = cantidadParseado;
            encontrado = true;
            updateCart();
            break;
        }
    }

    if (!encontrado) {
        fetch("https://api.escuelajs.co/api/v1/products/" + idProducto)
            .then(response => response.json())
            .then(product => {
                cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                });
                updateCart();
            });
    }
}


// Actualizar carrito
function updateCart() {
    cartItems.innerHTML = ''; 

    cart.forEach(function(item) {
        let cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');

        let cartContent = '';
        cartContent += '<h3>' + item.title + '</h3>';
        cartContent += '<p>' + item.price + ' USD</p>';
        cartContent += '<p>Cantidad: ' + item.quantity + '</p>';
        cartContent += '<button class="deleteButton" data-id="' + item.id + '">Eliminar</button>';
        cartContent += '<button class="reduceButton" data-id="' + item.id + '">-</button>';
        cartContent += '<button class="addButton" data-id="' + item.id + '">+</button>';

        cartItem.innerHTML = cartContent;
        cartItems.appendChild(cartItem);
    });

    mostrarBotones();

    localStorage.setItem('Shopping-Cart', JSON.stringify(cart));
}



function mostrarBotones() {
    let botonRestar = document.querySelectorAll(".reduceButton");
    let botonEliminar = document.querySelectorAll(".deleteButton");
    let botonAgregar = document.querySelectorAll(".addButton");

    botonRestar.forEach(button => {
        button.addEventListener("click", () => {
            for (let j = 0; j < cart.length; j++) {
                if (cart[j].id === parseInt(button.dataset.id)) {
                    if (cart[j].quantity > 1) {
                        cart[j].quantity--;
                    } else {
                        cart[j].quantity = 0;
                        cart.splice(j, 1);
                    }
                    updateCart();
                    break;
                }
            }
        });
    });

    botonAgregar.forEach(button => {
        button.addEventListener("click", () => {
            let idProducto = parseInt(button.dataset.id);
            for (let j = 0; j < cart.length; j++) {
                if (cart[j].id === idProducto) {
                    cart[j].quantity++;
                    updateCart();
                    break;
                }
            }
        });
    });

    botonEliminar.forEach(button => {
        button.addEventListener("click", () => {
            let idProducto = parseInt(button.dataset.id);
            for (let j = 0; j < cart.length; j++) {
                if (cart[j].id === idProducto) {
                    cart.splice(j, 1);
                    updateCart();
                    break;
                }
            }
        });
    });
}


// Mostrar detalles del producto
function mostrarDetalles(productId) {
    fetch('https://api.escuelajs.co/api/v1/products/' + productId)
        .then(function(response) {
            return response.json();
        })
        .then(function(product) {
            if (!product || Object.keys(product).length === 0) {
                return;
            }

            document.getElementById('product-title').textContent = product.title;
            document.getElementById('product-price').textContent = product.price + ' USD';
            document.getElementById('product-description').textContent = product.description;

            const productImagesContainer = document.getElementById('product-images');
            if (productImagesContainer) {
                productImagesContainer.innerHTML = ''; 
            }

            product.images.forEach(function(image) {
                const imgElement = document.createElement('img');
                imgElement.src = image;
                imgElement.alt = product.title;
                imgElement.classList.add('product-image');
                productImagesContainer.appendChild(imgElement);
            });

            productModal.classList.remove('hidden');
            productModal.classList.add('show');
        });
}


// Eventos
productsContainer.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' && e.target.textContent === 'Ver Detalles') {
        const idProducto = e.target.getAttribute('data-id');
        mostrarDetalles(idProducto);
    }
});


productsContainer.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' && e.target.textContent !== 'Ver Detalles') {
        const idProducto = e.target.getAttribute('data-id');
        addCarrito(idProducto);
    }
});


closeProductModalButton.addEventListener('click', function() {
    productModal.classList.remove('show');
    productModal.classList.add('hidden');
});


closeCartButton.addEventListener('click', function() {
    cartModal.classList.remove('show');
    cartModal.classList.add('hidden');
});


cartIcon.addEventListener('click', function() {
    cartModal.classList.remove('hidden');
    cartModal.classList.add('show');
});

//Conseguir la informacion del carro desde localStorage
function getCarro() {
    let carroLS = localStorage.getItem('Shopping-Cart');
    if (carroLS) {
        cart = JSON.parse(carroLS);
        updateCart();
    }
}


loadMoreButton.addEventListener('click', ()=> {
    loadProducts();
});


