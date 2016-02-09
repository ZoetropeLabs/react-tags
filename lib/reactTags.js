var React = require('react');
var ReactDOM = require('react-dom');
var Tag = require('./Tag');
var Suggestions = require('./Suggestions');
var { DragDropContext } = require('react-dnd');
var HTML5Backend = require('react-dnd-html5-backend');

// Constants
const Keys = {
    ENTER: 13,
    TAB: 9,
    BACKSPACE: 8,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    ESCAPE: 27
};

var ReactTags = React.createClass({
    propTypes: {
        tags: React.PropTypes.array,
        placeholder: React.PropTypes.string,
        labelField: React.PropTypes.string,
        suggestions: React.PropTypes.array,
        delimeters: React.PropTypes.array,
        autofocus: React.PropTypes.bool,
        inline: React.PropTypes.bool,
        handleDelete: React.PropTypes.func.isRequired,
        handleAddition: React.PropTypes.func.isRequired,
        handleDrag: React.PropTypes.func.isRequired,
        allowDeleteFromEmptyInput: React.PropTypes.bool,
        handleInputChange: React.PropTypes.func,
        minQueryLength: React.PropTypes.number,
        classNames: React.PropTypes.object,
        filterSuggestions: React.PropTypes.func.isRequired,
        suggestionsIdKey: React.PropTypes.string.isRequired,
        suggestionsDisplayKey: React.PropTypes.string.isRequired,
        onlyValidTags: React.PropTypes.bool,
        disableInput: React.PropTypes.bool,
        fullWidth: React.PropTypes.bool,
        errorMessage: React.PropTypes.string,
        allowDuplicates: React.PropTypes.bool,
    },
    getDefaultProps: function() {
        return {
            placeholder: 'Add new tag',
            tags: [],
            suggestions: [],
            delimeters: [Keys.ENTER, Keys.TAB],
            autofocus: true,
            inline: true,
            allowDeleteFromEmptyInput: true,
            minQueryLength: 2,
            classNames: {
              tags: 'ReactTags__tags',
              tagInput: 'ReactTags__tagInput',
              selected: 'ReactTags__selected',
              tag: 'ReactTags__tag',
              remove: 'ReactTags__remove',
              suggestions: 'ReactTags__suggestions',
              active: 'active',
              tagItemsLabel: 'ReactTags__tagItemsLabel'
            },
            onlyValidTags: true,
            disableInput: false,
            fullWidth: false,
            errorMessage: null,
            tagItemsLabel: 'Selected:',
        }
    },
    componentDidMount: function() {
        if (this.props.autofocus) {
            this.refs.input.focus();
        }
    },
    getInitialState: function() {
        return {
            suggestions: this.props.suggestions,
            query: "",
            selectedIndex: -1,
            selectionMode: false,
            errorMessage: null,
        }
    },
    componentWillReceiveProps(props) {
        // this.props.filterSuggestions(this.state.query, props.suggestions);
        this.setState({
          suggestions: props.suggestions,
          errorMessage: props.errorMessage
        })
    },

    handleDelete: function(i, e) {
        this.props.handleDelete(i);
        this.setState({ query: "" });
    },

    handleChange: function(e) {
        if (this.props.handleInputChange){
            this.props.handleInputChange(e.target.value.trim())
        }

        var query = e.target.value.trim();
        this.props.filterSuggestions(query, this.props.suggestions);

        this.setState({
            query: query,
        });
    },

    handleKeyDown: function(e) {
        var { query, selectedIndex, suggestions } = this.state;

        // hide suggestions menu on escape
        if (e.keyCode === Keys.ESCAPE) {
            e.preventDefault();
            this.setState({
                selectedIndex: -1,
                selectionMode: false,
                suggestions: []
            });
        }

        // When one of the terminating keys is pressed, add current query to the tags.
        // If no text is typed in so far, ignore the action - so we don't end up with a terminating
        // character typed in.
        if (this.props.delimeters.indexOf(e.keyCode) !== -1) {
            if (query !== "") {
                e.preventDefault();
                if (this.props.onlyValidTags && (this.props.suggestions.length === 0)) {
                  this.setState({
                    errorMessage: 'Please select one of the suggestions'
                  })
                }
                else {
                  if (this.state.selectionMode) {
                      query = this.props.suggestions[this.state.selectedIndex];
                  }
                  else {
                    if (this.props.suggestions[0]) {
                      query = this.props.suggestions[0]
                      this.addTag(query);
                    }
                    else if (!this.props.onlyValidTags) {
                      this.addTag(query);
                    }
                  }
                }
            }
        }

        // when backspace key is pressed and query is blank, delete tag
        if (e.keyCode === Keys.BACKSPACE && query == "" && this.props.allowDeleteFromEmptyInput) {
            this.handleDelete(this.props.tags.length - 1);
        }

        // up arrow
        if (e.keyCode === Keys.UP_ARROW) {
            e.preventDefault();
            var selectedIndex = this.state.selectedIndex;
            // last item, cycle to the top
            if (selectedIndex <= 0) {
                this.setState({
                  selectedIndex: this.props.suggestions.length - 1,
                  selectionMode: true
                });
            } else {
                this.setState({
                  selectedIndex: selectedIndex - 1,
                  selectionMode: true
                });
            }
        }

        // down arrow
        if (e.keyCode === Keys.DOWN_ARROW) {
            e.preventDefault();
            this.setState({
                selectedIndex: (this.state.selectedIndex + 1) % suggestions.length,
                selectionMode: true
            });
        }
    },
    addTag: function(tag) {
        var input = this.refs.input;

        // call method to add
        this.props.handleAddition(tag);

        // reset the state
        this.setState({
            errorMessage: null,
            query: "",
            selectionMode: false,
            selectedIndex: -1
        });

        // focus back on the input box
        input.clearValue();
        input.focus();
    },
    handleSuggestionClick: function(i, e) {
        this.addTag(this.props.suggestions[i]);
    },
    handleSuggestionHover: function(i, e) {
        this.setState({
            selectedIndex: i,
            selectionMode: true
        });
    },
    moveTag: function(id, afterId) {
        var tags = this.props.tags;

        // locate tags
        var tag = tags.filter(t => t.id === id)[0];
        var afterTag = tags.filter(t => t.id === afterId)[0];

        // find their position in the array
        var tagIndex = tags.indexOf(tag);
        var afterTagIndex = tags.indexOf(afterTag);

        // call handler with current position and after position
        this.props.handleDrag(tag, tagIndex, afterTagIndex);
    },
    render: function() {
        var tagItems = this.props.tags.map(function(tag, i) {
            return <Tag key={i}
                        tag={tag}
                        labelField={this.props.labelField}
                        tagIdKey={this.props.suggestionsIdKey}
                        tagDisplayKey={this.props.suggestionsDisplayKey}
                        onDelete={this.handleDelete.bind(this, i)}
                        moveTag={this.moveTag}
                        classNames={this.props.classNames}/>
        }.bind(this));

        // get the suggestions for the given query
        var query = this.state.query.trim(),
            selectedIndex = this.state.selectedIndex,
            placeholder = this.props.placeholder;


        const tagItemsLabel = (
            <span className={this.props.classNames.tagItemsLabel}>{this.props.tagItemsLabel}</span>
        );
        const tagInput =  (
            <div className={this.props.classNames.tagInput}>
                <this.props.inputComponent ref="input"
                       type="text"
                       disabled={this.props.disabled}
                       fullWidth={this.props.fullWidth}
                       onChange={this.handleChange}
                       floatingLabelText={placeholder}
                       onKeyDown={this.handleKeyDown}
                       errorText={this.state.errorMessage}/>
                <Suggestions query={query}
                             suggestions={this.state.suggestions}
                             selectedIndex={selectedIndex}
                             handleClick={this.handleSuggestionClick}
                             handleHover={this.handleSuggestionHover}
                             minQueryLength={this.props.minQueryLength}
                             suggestionsDisplayKey = {this.props.suggestionsDisplayKey}
                             suggestionsIdKey = {this.props.suggestionsIdKey}
                             classNames={this.props.classNames}/>
            </div>
        );

        return (
            <div className={this.props.classNames.tags}>
                <div className={this.props.classNames.selected}>
                    {!this.props.inline && tagItemsLabel}
                    {tagItems}
                    {this.props.inline && tagInput}
                </div>
                {!this.props.inline && tagInput}
            </div>
        )
    }
});

module.exports = {
    WithContext: DragDropContext(HTML5Backend)(ReactTags),
    WithOutContext: ReactTags,
    Keys: Keys
};
