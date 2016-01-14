'use strict';

var React = require('react');

var _require = require('react-dnd');

var DragSource = _require.DragSource;
var DropTarget = _require.DropTarget;

var flow = require('lodash/function/flow');

var ItemTypes = { TAG: 'tag' };

var tagSource = {
    beginDrag: function beginDrag(props) {
        return { id: props.tag.id };
    }
};

var tagTarget = {
    hover: function hover(props, monitor) {
        var draggedId = monitor.getItem().id;
        if (draggedId !== props.id) {
            props.moveTag(draggedId, props.tag.id);
        }
    }
};

function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget()
    };
}

var Tag = React.createClass({
    displayName: 'Tag',

    propTypes: {
        labelField: React.PropTypes.string,
        onDelete: React.PropTypes.func.isRequired,
        tag: React.PropTypes.object.isRequired,
        moveTag: React.PropTypes.func.isRequired,
        classNames: React.PropTypes.object
    },
    getDefaultProps: function getDefaultProps() {
        return {
            labelField: 'text'
        };
    },
    render: function render() {
        var label = this.props.tag[this.props.labelField];
        var _props = this.props;
        var connectDragSource = _props.connectDragSource;
        var isDragging = _props.isDragging;
        var connectDropTarget = _props.connectDropTarget;

        return connectDragSource(connectDropTarget(React.createElement(
            'span',
            { style: { opacity: isDragging ? 0 : 1 },
                className: this.props.classNames.tag },
            label,
            React.createElement(
                'a',
                { className: this.props.classNames.remove,
                    onClick: this.props.onDelete },
                'x'
            )
        )));
    }
});

module.exports = flow(DragSource(ItemTypes.TAG, tagSource, dragCollect), DropTarget(ItemTypes.TAG, tagTarget, dropCollect))(Tag);