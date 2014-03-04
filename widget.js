/*global WAF, $ */

'use strict';

WAF.define('Select2', ['waf-core/widget'], function (widget) {

    var Select2 = widget.create('Select2', {

        items: widget.property({
            type: 'datasource',
            attributes: [{
                name: 'id' // Option key
            }, {
                name: 'text' // Option displayed text
            }, {
                name: 'group' // Option parent group
            }]
        }),

        init: function () {

            var self = this,
                subscriber,
                isGroupingNeeded = !!this.items.attributeFor('group');

            this.node.innerHTML = '<input />';
            this.$selectNode = $('input', this.node);

            // Initialize our widget with empty options
            this.$selectNode.select2({
                data: [],
                width: '100%'
            });

            // ****** Events 
            // Propagate select2 events to waf listeners
            this.$selectNode.on({
                "change": function (e) {
                    subscriber.pause();
                    self.items().selectByKey(e.val);
                    subscriber.resume();
                    self.fire("change", e.data);
                },
                "select2-opening": function (e) {
                    self.fire('opening', e.data);
                },
                "select2-open": function (e) {
                    self.fire('open', e.data);
                },
                "select2-highlight": function (e) {
                    self.fire('highlight', e.data);
                },
                "select2-selecting": function (e) {
                    self.fire('selecting', e.data);
                },
                "select2-focus": function (e) {
                    self.fire('focus', e.data);
                },
                "select2-blur": function (e) {
                    self.fire('blur', e.data);
                }
            });

            // Propagate event source event to select2 plugin
            this.items.onCollectionChange(function (elements) {
                var id;

                if (!elements.length) {
                    return;
                }

                if (isGroupingNeeded) {
                    elements = formatedGroup(elements);
                }

                self.$selectNode.select2({
                    width: 'element',
                    data: elements
                });

                id = self.items().ID;
                self.$selectNode.select2("val", id);
            });

            // update our combobox upon selecting a record
            if (this.items()) {
                subscriber = this.items().subscribe('currentElementChange', function () {
                    var id = self.items().ID;
                    if (id) {
                        self.$selectNode.select2("val", id);
                    }
                });
            }

            function formatedGroup(elements) {
                var i, len = elements.length, group, groups = [], index;
                for (i = 0; i < len; i += 1) {
                    group = elements[i].group;

                    index = indexOfGroup(groups, group);


                    if (index !== -1) {
                        groups[index].children.push({
                            id: elements[i].id,
                            text: elements[i].text,
                        });
                    } else {
                        groups.push({
                            text: group,
                            children: [{
                                id: elements[i].id,
                                text: elements[i].text,
                            }]
                        });
                    }
                }
                return groups;
            }

            function indexOfGroup(groups, group) {
                var j, max = groups.length;
                for (j = 0; j < max; j += 1) {
                    if (groups[j].text == group) {
                        return j;
                    }
                }
                return -1;
            }
        },

        // expose select2 API
        open: function () {
            this.$selectNode.select2('open');
        },

        close: function () {
            this.$selectNode.select2('close');
        },

        enable: function () {
            this.$selectNode.select2("enable", true);
        },

        disable: function () {
            this.$selectNode.select2("enable", false);
        },

        selectedData: function () {
            return this.$selectNode.select2('data');
        }
    });

    return Select2;
});