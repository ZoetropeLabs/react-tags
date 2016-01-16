var React = require('react');

var Suggestions = React.createClass({
    propTypes: {
        query: React.PropTypes.string.isRequired,
        selectedIndex: React.PropTypes.number.isRequired,
        suggestions: React.PropTypes.array.isRequired,
        handleClick: React.PropTypes.func.isRequired,
        handleHover: React.PropTypes.func.isRequired,
        minQueryLength: React.PropTypes.number,
        classNames: React.PropTypes.object,
        suggestionsIdKey: React.PropTypes.string,
        suggestionsDisplayKey: React.PropTypes.string,
    },
    markIt: function(input, query) {
      if (input) {
        var escapedRegex = query.trim().replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
        var r = RegExp(escapedRegex, "gi");
        return {
          __html: input.replace(r, "<mark>$&</mark>")
        }
      } else {
        return {
          __html: input
        }
      }
    },
    render: function() {
        var props = this.props;
        var suggestions = this.props.suggestions.map(function(item, i) {
            let idVal = item[props.suggestionsIdKey].toString() || ''
            let displayVal = item[props.suggestionsDisplayKey] || ''
            return (
                <li key={idVal}
                    onClick={props.handleClick.bind(null, i)}
                    onMouseOver={props.handleHover.bind(null, i)}
                    className={i == props.selectedIndex ? props.classNames.active : ""}>
                    <span dangerouslySetInnerHTML={this.markIt(displayVal, props.query)}/>
                 </li>
            )
        }.bind(this));

        var minQueryLength = props.minQueryLength || 2;
        if (suggestions.length === 0 || props.query.length < minQueryLength) {
            return <div className={this.props.classNames.suggestions}></div>
        }

        return (
            <div className={this.props.classNames.suggestions}>
                <ul> { suggestions } </ul>
            </div>
        )
    }
});

module.exports = Suggestions;
