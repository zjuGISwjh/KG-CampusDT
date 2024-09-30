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

    // get subgraph
    const fetchSubGraph = async (node) => {
        const idFieldName = `${label}_id`;
        const nodeid = node[idFieldName];
        try {
            const response = await fetch(`http://localhost:8083/api/getSubGraphA?label=${label}&id=${nodeid}`, {
                method: 'GET',
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Fetched relations:", data);
            drawRelations(data,node);
        } catch (error) {
            console.error('Error fetching relations:', error);
        }
    };

    // draw relationship
    const drawRelations = (data,sourceNode) => {
        const svg = d3.select(svgRef.current);
    const g = svg.select('g');

    const relations = data.map(item => ({
        source: sourceNode.name,
        target: item.node.name,
    }));

    const links = relations.map(r => ({
        source: r.source,
        target: r.target,
    }));

    // draw relationship
    const link = g.selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-width', 2);

    const targetNodes = data.map(item => ({
        name: item.node.name,
        x: Math.random() * svg.node().clientWidth, //random position
        y: Math.random() * svg.node().clientHeight,
    }));

    // draw target node
    const targetNode = g.selectAll('.target-node')
        .data(targetNodes)
        .enter()
        .append('g')
        .attr('class', 'target-node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

    targetNode.append('circle')
        .attr('r', 20)
        .attr('fill', '#ff6347');

    targetNode.append('text')
        .text(d => d.name)
        .attr('dx', 10)
        .attr('dy', 3);

    // update link and node
    const allNodes = [sourceNode, ...targetNodes];
    
    const simulation = d3.forceSimulation(allNodes)
        .force('link', d3.forceLink().id(d => d.name).distance(50))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(svg.node().clientWidth / 2, svg.node().clientHeight / 2))
        .on('tick', () => {
            link
                .attr('x1', d => {
                    return d.source === sourceNode.name ? sourceNode.x : d.source.x;
                })
                .attr('y1', d => {
                    return d.source === sourceNode.name ? sourceNode.y : d.source.y;
                })
                .attr('x2', d => {
                    //return d.target.x;
                    const targetNodeData = targetNodes.find(node => node.name === d.target);
                    return targetNodeData ? targetNodeData.x : 0; // add default
                })
                .attr('y2', d => {
                    //return d.target.y;
                    const targetNodeData = targetNodes.find(node => node.name === d.target);
                    return targetNodeData ? targetNodeData.y : 0;
                });

            targetNode.attr('transform', d => `translate(${d.x}, ${d.y})`);
        });
        
        /*const drag = d3.drag()
        .on('start', (event, d) => {
            event.sourceEvent.stopPropagation();
            if (!event.active) simulation.alphaTarget(0.01).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });*/

        // apply drag to source node
        /*const sourceNodeGroup = g.selectAll('.source-node')
            .data([sourceNode])
            .enter()
            .append('g')
            .attr('class', 'source-node')
            .call(drag);

        sourceNodeGroup.append('circle')
            .attr('r', 10)
            .attr('fill', '#69b3a2');

        sourceNodeGroup.append('text')
            .text(sourceNode.name)
            .attr('dx', 10)
            .attr('dy', 3);

        // update source node position
        sourceNodeGroup.attr('transform', d => `translate(${d.x}, ${d.y})`);*/
        console.log("Drawing relations:", data);
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
        //TODO: add flag to determine single node/ subgraph
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
            .on('click', (event, d) =>{ 
                handleNodeClick(d);
                showButton(d);
            })
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

        //TODO: update source node and button position after drag


        function showButton(node) {
            const buttonGroup = g.selectAll('.button-group').data([node]);
            const buttonEnter = buttonGroup.enter().append('g')
                .attr('class', 'button-group')
                .attr('transform', `translate(${node.x + 30}, ${node.y})`)
                .on('click', (event, d) => fetchSubGraph(d));

            buttonEnter.append('rect')
                .attr('width', 80)
                .attr('height', 30)
                .attr('fill', '#ffcc00');

            buttonEnter.append('text')
                .attr('x', 40)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .text('查看关系');

            // update button position
            buttonGroup.exit().remove();
            buttonGroup.attr('transform', `translate(${node.x + 30}, ${node.y})`);
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