class PlayerOrderViewModel {
    constructor(orderColumn) {
        this.orderColumn = orderColumn;
    }

    updateOrder(column) {
        this.orderColumn = this.orderColumn === column ? `-${column}` : column;
    }
}