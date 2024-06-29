class PlayerOrderViewModel {
    constructor() {
        this.orderColumn = 'position.id';
    }

    updateOrder(column) {
        this.orderColumn = this.orderColumn === column ? `-${column}` : column;
    }
}