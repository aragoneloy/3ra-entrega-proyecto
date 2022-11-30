
const socket = io();



//---------------PRODUCTOS

socket.on('from-server-productos', productos =>{
    renderProductos(productos)
})

function renderProductos(productos) {
    const cuerpoProductosHTML = productos.map((prod)=>{
                return `<tr>
                <td>${prod.title}</td>
                <td>${prod.price}</td>
                <td>
                    <img width="30" src="${prod.thumbnail}" alt="">
                </td>
            </tr>`
    })
    
    console.log(cuerpoProductosHTML)
    document.querySelector('#listadoProductos').innerHTML = cuerpoProductosHTML
    // document.querySelector('#listadoProductos').insertAdjacentHTML("beforeend", cuerpoProductosHTML[cuerpoProductosHTML.length - 1])
}

function agregarProducto() {
    

    const inputTitle = document.querySelector('#title')
    const inputPrice = document.querySelector('#price')
    const inputThumbnail = document.querySelector('#thumbnail');

    const producto = {
        title: inputTitle.value,
        price: inputPrice.value,
        thumbnail: inputThumbnail.value
    }

    socket.emit('from-client-producto', producto)
}

