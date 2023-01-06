
export class VinRepeditos {
    public vin: string;
    public tickets: TicketPorVin[];

    constructor(vin: string, tickets: TicketPorVin[]) {
        this.vin = vin;
        this.tickets = tickets;
    }
}

export class TicketPorVin {
    public id: number;
    public ticket: string;

    constructor(id: number, ticket: string) {
        this.id = id;
        this.ticket = ticket;
    }
}