import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import classNames from 'classnames';

import DefaultGroupRenderer from './filtering/DefaultGroupRenderer';
import {filterNodes} from './selectors/filtering';
import UnfilteredNodesContext from './UnfilteredNodesContext';

const indexByName = searchTerm => ({name}) => {
  const upperCaseName = name.toUpperCase();
  const upperCaseSearchTerm = searchTerm.toUpperCase();

  return upperCaseName.indexOf(upperCaseSearchTerm.trim()) > -1;
};

export default class FilteringContainer extends React.Component {
  state = {
    filterText: '',
    filterTerm: '',
  };

  static defaultProps = {
    debouncer: debounce,
    groupRenderer: DefaultGroupRenderer,
    indexSearch: indexByName,
  };

  constructor(props) {
    super(props);

    this.setFilterTerm = props.debouncer(this.setFilterTerm, 300);
  }

  getContextValue(nodes) {
    if (!this.contextValue || this.contextValue.unfilteredNodes !== nodes) {
      this.contextValue = {unfilteredNodes: nodes};
    }

    return this.contextValue;
  }

  setFilterTerm() {
    this.setState(ps => ({filterTerm: ps.filterText}));
  }

  handleFilterTextChange = e => {
    const filterText = e.target.value;

    this.setState({filterText});

    this.setFilterTerm();
  };

  render() {
    const {filterTerm, filterText} = this.state;
    const {
      nodes,
      children: treeRenderer,
      groups,
      selectedGroup,
      groupRenderer: GroupRenderer,
      onSelectedGroupChange,
      indexSearch,
    } = this.props;

    const relevantNodes =
      groups && selectedGroup && groups[selectedGroup]
        ? filterNodes(groups[selectedGroup].filter, nodes)
        : {nodes, nodeParentMappings: {}};

    const {nodes: filteredNodes, nodeParentMappings} = filterTerm
      ? filterNodes(indexSearch(filterTerm, relevantNodes.nodes), relevantNodes.nodes)
      : relevantNodes;

    return (
      <UnfilteredNodesContext.Provider value={this.getContextValue(nodes)}>
        <div className="tree-filter-container">
          <div className={classNames('tree-lookup-input', {group: !!groups})}>
            <input value={filterText} onChange={this.handleFilterTextChange} placeholder="Search..." />
            <i aria-hidden="true" className="mi mi-11 mi-search" />
            {groups && <GroupRenderer groups={groups} selectedGroup={selectedGroup} onChange={onSelectedGroupChange} />}
          </div>
          {treeRenderer({nodes: filteredNodes, nodeParentMappings})}
        </div>
      </UnfilteredNodesContext.Provider>
    );
  }
}

FilteringContainer.propTypes = {
  children: PropTypes.func.isRequired,
  debouncer: PropTypes.func,
  groups: PropTypes.object,
  selectedGroup: PropTypes.string,
  groupRenderer: PropTypes.func,
  onSelectedGroupChange: PropTypes.func,
  indexSearch: PropTypes.func,
};
