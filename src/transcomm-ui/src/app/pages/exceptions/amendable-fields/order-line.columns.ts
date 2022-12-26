export type OrderLineColumnType = 'num_inpt' | 'str_inpt' | 'select' | 'index';
export type SelectOption = 'goods_condition' | 'quantity_unit' | 'weight_unit';

export interface OrderLineColumn {
    name: string;
    controlName: string;
    type?: OrderLineColumnType;
    selectorOption?: SelectOption;
}

export const columns: OrderLineColumn[] = [
    {
        name: 'Line No.',
        controlName: '',
        type: 'index'
    },
    {
        name: 'Commodity Code',
        controlName: 'commodityCode',
        type: 'num_inpt'
    },
    {
        name: 'Goods Description',
        controlName: 'description',
        type: 'str_inpt'
    },
    {
        name: 'Goods Condition',
        controlName: 'goodsCondition',
        type: 'select',
        selectorOption: 'goods_condition'
    },
    // {
    //     name: 'COO',
    //     controlName: ''
    // },
    {
        name: 'Quantity',
        controlName: 'quantity',
        type: 'num_inpt'
    },
    {
        name: 'Quantity Unit',
        controlName: 'quantityUnit',
        type: 'select',
        selectorOption: 'quantity_unit'
    },
    {
        name: 'Weight',
        controlName: 'weight',
        type: 'num_inpt'
    },
    {
        name: 'Unit',
        controlName: 'weightUnit',
        type: 'select',
        selectorOption: 'weight_unit'
    },
    {
        name: 'Value of Goods',
        controlName: 'total',
        type: 'num_inpt'
    },
    // {
    //     name: 'Currency',
    //     controlName: ''
    // },
    {
        name: 'Suppl Quantity',
        controlName: 'supplQuantity',
        type: 'num_inpt'
    },
    {
        name: 'Suppl Quantity Unit',
        controlName: 'supplQuantityUnit',
        type: 'select',
        selectorOption: 'weight_unit'
    },
];