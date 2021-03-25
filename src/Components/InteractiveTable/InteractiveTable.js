import React, { useState, useEffect, Component } from 'react';
import TableFilter from './TableFilter';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Api from '../../api';
import { fruitVocabulary, berryVocabulary } from '../../vocabulary';
import './InteractiveTable.scss';
import { filterHeadlines, filterBody } from './util';


class InteractiveTable extends Component {

    componentDidMount () {
        this.uploadData();
    }

    state = {
        body: [],
        headlines: [],
        portionNumber: 0,
        key: null,
        rule: 'text',
        sortLabels: null,
        filter: [],
        hiddenColumns: []
    }

    container = React.createRef();


    showColumn = (column) => {
        this.setState((state) => {
            return {
                hiddenColumns: state.hiddenColumns.filter( item => {
                    return (item !== column)
                })
            }
        })
    }

    hideColumn = (column) => {
        this.setState((state) => {
            return {
                hiddenColumns: [...state.hiddenColumns, column]
            }
        })
    }

    sortASC = (key, rule) => {
        this.setState((state) => {
            return {key, rule, sortLabels: {...state.sortLabels, [key]: !state.sortLabels[key]}};
        });
    }

    setFilter = (value) => {
        this.setState((state) => {
            return {filter: [...state.filter, value]};
        });
    }

    removeFilter = (value) => {
        this.setState((state) => {
            return {filter: state.filter.filter( item => {
                return (item !== value)
            })};
        });
    }

    checkScrollTop = () => {
        let elem = this.container.current;
        let result = elem.scrollHeight - (elem.scrollTop + elem.clientHeight)
        if(result === 0) {
            this.uploadData();
        }
    }

    uploadData = () => {
        if(this.state.headlines.length === 0) {
            this.setState( () => {

                const newObj = {};
                const headlines = Api.getHeadlines();

                headlines.forEach( item => {
                    newObj[item.key] = true;
                })
            
                return { headlines: headlines,
                    sortLabels: {...newObj}
                }
            })
        }

        this.setState( (state)=>{
            return { body: [...state.body, ...Api.getPortionData(4, state.portionNumber)],
                portionNumber: state.portionNumber + 1
            }
        })
    }

    render () {
        if(this.state.body.length > 0 && this.state.body.length > 0) {
            const filteredHeadlines = filterHeadlines(this.state.headlines, this.state.hiddenColumns)
            const filteredBody = filterBody(this.state.body, this.state.filter, this.state.key, this.state.rule, this.state.sortLabels)

            return  (
                <div className='interactiveTable' onScroll={this.checkScrollTop} ref={this.container}>
                    <TableFilter setFilter={this.setFilter} 
                                removeFilter={this.removeFilter} 
                                hiddenColumns={this.state.hiddenColumns}
                                showColumn={this.showColumn}
                            />
                    <table>
                        <TableHeader headlines={filteredHeadlines} 
                                    sortASC={this.sortASC} 
                                    sortLabels={this.state.sortLabels}
                                    hideColumn={this.hideColumn}
                                    hiddenColumns={this.state.hiddenColumns}
                                />
                        <TableBody body={filteredBody} headlines={filteredHeadlines} />
                    </table>
                </div>
            )
        } return null
    }
}

export default InteractiveTable;