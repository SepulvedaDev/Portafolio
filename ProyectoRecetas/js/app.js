function iniaciarApp(){
    const resultado = document.querySelector('#resultado');
    const SelectCategorias = document.querySelector('#categorias');
    
    if(SelectCategorias){
        SelectCategorias.addEventListener('change',seleccionarCategoria);
        obtenerCategorias()
        
    }

    const favoritoDiv = document.querySelector('.favoritos');
    if(favoritoDiv){
        obtenerFavoritos();
    }


    const modal = new bootstrap.Modal('#modal', {});



    function obtenerCategorias(){
        
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

        fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarCategorias(resultado.categories))
    }

    function mostrarCategorias (categorias = []){
        categorias.forEach(categoria => {
            const {strCategory,strCategoryThumb} = categoria
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;

            SelectCategorias.appendChild(option);
        })
    }

    function seleccionarCategoria (e){
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarRecetas(resultado.meals))
    }
    function mostrarRecetas (recetas = []){
        

        limpiarHTML(resultado)

        const heading = document.createElement('H2');
        heading.classList.add('text-center','text-black','my-5');
        heading.textContent = recetas.length ? 'Resultados': 'No hay resultados';
        resultado.appendChild(heading);

        //Iterar los resultados
        recetas.forEach(recetas =>{
            const {idMeal,strMeal,strMealThumb} = recetas;
            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');
            
            const recetaCard = document.createElement('div');
            recetaCard.classList.add('card','mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top')
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? recetas.titulo}`
            recetaImagen.src = strMealThumb ?? recetas.img;
            
            const recetaCardBody = document.createElement('DIV')
            recetaCardBody.classList.add('card-body');
            
            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? recetas.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn','btn-danger', 'w-100');
            recetaButton.textContent = 'Ver receta';

            recetaButton.onclick = function(){
                seleccionarReceta(idMeal ?? recetas.id)
            }


            // Inyectar en el codigo HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);

        })
    }
    function seleccionarReceta (id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => mostrarRecetaModal(datos.meals[0]))
    }
    
    function mostrarRecetaModal(receta){
        const {idMeal,strInstructions,strMeal,strMealThumb,strIngredient} = receta; 

        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        const modalfooter = document.querySelector('.modal-footer')
        limpiarHTML(modalfooter)

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}">
        <h3 class="text-center mt-3">Intrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class"my-3">Ingredientes y cantidades</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        // Mostrar cantidades e ingredientes
        for(let i = 1; i <= 20; i++){
            if(receta[`strIngredient${i}`]){
                const ingredientes = receta[`strIngredient${i}`];
                const cantidades = receta[`strMeasure${i}`]

                const ingredientesLi = document.createElement('LI');
                ingredientesLi.classList.add('list-group-item');
                ingredientesLi.textContent = `${ingredientes} - ${cantidades}`
                listGroup.appendChild(ingredientesLi);
            }
        }
        modalBody.appendChild(listGroup);
        

        // Botones de cerrar y favoritos
        const favoritoBtn = document.createElement('BUTTON');
        favoritoBtn.classList.add('btn','btn-danger','col')
        favoritoBtn.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        //localstorage
        favoritoBtn.onclick = function (){

            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                favoritoBtn.textContent = 'Guardar Favorito'
                mostrarToast('Eliminado correctamente')
                return;
            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            favoritoBtn.textContent = 'Eliminar Favorito'
            mostrarToast('Guardado correctamente')
        }


        const cerrarBtn = document.createElement('BUTTON');
        cerrarBtn.classList.add('btn','btn-secondary','col')
        cerrarBtn.textContent = 'Cerrar';
        cerrarBtn.onclick = function (){
            modal.hide();
            //se usa hide para cerrar
        }

        
        modalfooter.appendChild(favoritoBtn);
        modalfooter.appendChild(cerrarBtn);





        // Muestra el modal
        modal.show()
    }

    function agregarFavorito (receta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]))
    }

    function eliminarFavorito(id){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const nuevofavorito = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(nuevofavorito))
    }

    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }

    function mostrarToast(mensaje){

        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();

    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length){

            mostrarRecetas(favoritos);
            return
        }

        const noFavorito = document.createElement('P');
        noFavorito.textContent = 'No hay favotiros aun';
        noFavorito.classList.add('fs-4','text-center', 'font-bold','mt-5');
        favoritoDiv.appendChild(noFavorito)

    }
    
    function limpiarHTML (selector){
        while(selector.firstChild)
            selector.removeChild(selector.firstChild)
    }
}


document.addEventListener('DOMContentLoaded',iniaciarApp);