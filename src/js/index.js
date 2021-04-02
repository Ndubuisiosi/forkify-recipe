import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Like';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader, elementStrings} from './views/base';


/*** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {}; 
window.state = state;


/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    //Get query from the view
    const query = searchView.getInput();

    if(query){
        //2 New search object and add to state
        state.search = new Search(query);
        try{
            //3 Prepare UI for result

            searchView.clearInput(); //clear input field
            searchView.clearResult();

            renderLoader(elements.searchRes);
            //4 search for recipe
            await state.search.getResults();

            //5 render result on UI
            clearLoader();
            searchView.renderResult(state.search.result);
        }catch(err){
            alert(`Something went wrong with the search. ${err}`);
            clearLoader();
        }
 
    }
     
};
 

elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', (e) => {
    const btn = e.target.closest(`.${elementStrings.btn}`);
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        //console.log(goToPage);
        searchView.clearResult();
        searchView.renderResult(state.search.result, goToPage);
        
    }
    
});


/**
 * RECIPE CONTOLLER
 */
const controlRecipe = async () => {
    //Get Id from url
    const id = window.location.hash.replace('#', '');
    //console.log(id);

    if(id){
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected search icon

        if(state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try{ 
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            
            state.recipe.parseIngredients();
            //calculate serving and time
        
            state.recipe.calcServings();
            state.recipe.calcTime();
        
            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        }
        catch(err){
            alert(`Error processing recipe: ${err}`);
        }
   
    }
};

//  window.addEventListener('hashchange', controlRecipe);
//  window.addEventListener('load', controlRecipe);
const events = ['hashchange', 'load'];
events.forEach(cur => window.addEventListener(cur, controlRecipe));


/****
 * LIST CONTROLLER
 */

 const controlList = () => {
    // Create a new list IF there is none yet
    if (!state.list) state.list = new List();
    
    //add each ingredients to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
 };



 /****
 * LIKE CONTROLLER
 */
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

 const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const curID = state.recipe.id;
    // User has not yet liked current recipe
    if(!state.likes.isLiked(curID)){
        //ADD like to state
        const newlike = state.likes.addLike(
            curID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        
        //Toggle the like button
            likesView.toggleLikeBtn(true);

        //ADD like to UI list
        likesView.renderLike(newlike);

    //user has liked current recipe
    } else{ 
         //REMOVE like from the state
        state.likes.deleteLike(curID);
        
        //Toggle the like button
        likesView.toggleLikeBtn(false);

        //REMOVE like from UI list

        likesView.deleteLike(curID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
 };

 //Hnadle delete and update list item event
 elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);

        //Handle count update
    } else if(e.target.matches('.shopping__count-value')){
            const val = parseFloat(e.target.value);
            if (val > 0) {state.list.updateCount(id, val);}
            return val;       
    }
 });


 //  Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button is clicked.
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();

    } else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }


});

window.l = new List();