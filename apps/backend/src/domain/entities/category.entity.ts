export class Category {
    constructor(
        public id: string | null,
        public userId: string,
        public name: string,
        public color: string,
        public icon: string,
        public isDefault: boolean,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}
