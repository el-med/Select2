/*global WAF, $, ds */

'use strict';

WAF.define('Select2', ['waf-core/widget'], function (widget) {

    var Select2 = widget.create('Select2', {

        value: widget.property({
            defaultValue: '',
            bindable : true
        }),

        items: widget.property({
            type: 'datasource',
            attributes: [{
                name: 'id' // Option key
            }, {
                name: 'text' // Option displayed text
            }]
        }),

        init: function () {
            var self = this;

            this.node.innerHTML = '<input />';
            this.$selectNode = $('input', this.node);

            // Initialize our widget with empty options
            this.$selectNode.select2({
                data: [],
                width: '100%'
            });

            // If the collection of the datasource items change, the elements in the DropDownMenu change accordingly.
            this.items.onCollectionChange(function (elements) {
                var currentValue;

                currentValue = this.value();

                // Check to see if there is any element on the new collection
                if (!elements.length) {
                    return;
                }

                // Initialize select2 with new data
                self.$selectNode.select2({
                    width: 'element',
                    data: elements
                });

                // Initialize the combobox with the current value
                if (currentValue) {
                    this.$selectNode.select2("val", currentValue);
                }
            });

            // If the value of the attribute countryCode of the datasource person1 change, 
            // the selected element in the DropDownMenu change
            this.value.onChange(function () {
                var currentValue, key, dataClass;

                currentValue = this.value();
                key = this.items.attributeFor('id');
                dataClass = this.items().getClassTitle();
                ds[dataClass].find(key + ' LIKE ' + currentValue, {
                    'onSuccess': function (e) {
                        if (e.entity) {
                            self.$selectNode.select2("val", currentValue);
                        } else {
                            //@TODO: if no element match the value of the attribute, the widget should raise an error
                            return;
                        }
                    }
                });
            });

            // When the user select another item in the DropDownMenu, the value of the attribute "id" of 
            // the selected item is copied to the attribute value of the datasource value.
            this.$selectNode.on({
                "change": function (e) {
                    var bindedValue = self.boundAttributes.value;
                    if (bindedValue) {
                        bindedValue.datasource[bindedValue.attribute] = this.value;
                        bindedValue.datasource.save();
                        self.fire("change", e.data);
                    } else {
                        self.value(this.value);
                    }
                }
            });
        }
    });

    return Select2;
});