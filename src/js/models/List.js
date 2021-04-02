import uniqid from 'uniqid';

export default class List {
    constructor(){
        this.items = [];
    }

    addItem (count, unit, ingredient){

        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id){
        const index = this.items.findIndex(el => el.id === id);
        // [2,3,4] splice(1,1) -> returns 3 and original array is [2,4] {can mutate original array}
        // [2,3,4] slice(1,1) -> returns 3 and original array is [2,3,4] {cannot}
        
        this.items.splice(index, 1);
    }

    updateCount(id, newCount){
     this.items.find(el => el.id === id).count = newCount;
    }
} 