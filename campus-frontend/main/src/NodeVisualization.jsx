import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//for knowledge graph visualization
const NodeVisualization = ({ nodes,label,updateNodeDetails, }) => {
    const svgRef = useRef();

    // handle node click
    const handleNodeClick = async(node) => {
        const idFieldName = `${label}_id`;
        const nodeid = node[idFieldName];
        if (!nodeid) {
            console.error("Node ID not found for label:", label);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8083/api/getSingleNode?label=${label}&id=${nodeid}`, {
                method: 'GET',
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Fetched data:", data);
            // if the action is correct, data is a list with only 1 json
            updateNodeDetails(data[0]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // initialize the force-directed graph
    const initializeGraph = () => {
        const svg = d3.select(svgRef.current);
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;

        // clear all previous content
        svg.selectAll("*").remove();

        // zoom behavior, only apply to the background
        const zoom = d3.zoom()
        .scaleExtent([0.1, 3])  // restrict the zoom scale
        .on('zoom', (event) => {
            svg.select('g')  // select element group
               .attr('transform', event.transform);
        });

        // apply the zoom behavior to the SVG
        svg.call(zoom).on('dblclick.zoom', null);;

        // group for the elements to zoom
        const g = svg.append('g');

        const simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(-50))  // repulsive force between nodes
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30))  // avoid overlap
            .on('tick', ticked);  // update node position

        // drap behavior
        const drag = d3.drag()
            .on('start', (event, d) => {
                event.sourceEvent.stopPropagation();  // stop zoom
                if (!event.active) simulation.alphaTarget(0.01).restart();  // define alpha
                d.fx = d.x;  // fixed x
                d.fy = d.y;
                console.log("start")
            })
            .on('drag', (event, d) => {
                d.fx = event.x;  // update x
                d.fy = event.y;
                console.log("drag")
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
                console.log("end")
            });
        // draw node
        const circles = g.selectAll('circle')
        //const circles = svg.selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 20)
            .attr('fill', '#69b3a2')
            .on('click', (event, d) => handleNodeClick(d))
            .call(drag);

        
        const labels = g.selectAll('text')
        //const labels = svg.selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .text(d => d.name)// only for labels with name field
            .attr('text-anchor', 'middle')
            .attr('dy', 5);

        // update position each tick
        function ticked() {
            circles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        }

        // clear simulation and svg
        return () =>{ 
            console.log("Cleaning up NodeVisualization");
            simulation.stop();
            svg.selectAll('*').remove();
        }
    };

    // ummount the component
    useEffect(() => {
        const cleanup = initializeGraph();
        return () => {
            cleanup();
        };
    }, [nodes]);

    return (
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    );
};

export default NodeVisualization;