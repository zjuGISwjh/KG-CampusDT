import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//for knowledge graph visualization
const NodeVisualization = ({ nodes,label,updateNodeDetails, }) => {
    const svgRef = useRef();
    var links;
    var simulation;

    const drawMenu = (node, menuItems, g) => {
        // clean menu
        g.selectAll('.menu-item').remove();
    
        const menuRadius = 80;
        const numItems = menuItems.length;
        const angleStep = (2 * Math.PI) / numItems;
        const gap = 0.1;
    
        // arx generator
        const arc = d3.arc()
            .innerRadius(52)
            .outerRadius(menuRadius);
    
        menuItems.forEach((menuItem, i) => {
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep - gap;
    
            // arc shape menu
            const arcPath = arc({ startAngle, endAngle });
            var tmp={
                startAngle: startAngle,
                endAngle: endAngle
            };
            var centroid = arc.centroid(tmp);
    
            const itemGroup = g.append('g')
                .attr('class', 'menu-item')
                .datum(node)  // bind node to menu item
                .attr('transform', `translate(${node.x}, ${node.y})`);
    
            itemGroup.append('path')
                .attr('d', arcPath)
                .attr('fill', '#ffcc00')
                .on('click', () => {
                    console.log(`Clicked on menu item: ${menuItem}`);
                    if(menuItem=='SubGraph'){
                        console.log("subgraph");
                        links=fetchSubGraph(node)
                    }
                });
    
            // add text
            var str;
            const deg = (startAngle + endAngle) * 180/ (2 * Math.PI);
            if ( deg < 90 || deg > 270) {
                str= 'rotate('+ deg +', '+(centroid[0])+' '+(centroid[1])+ ')'
              } else {
                str= 'rotate('+ (deg + 180) +', '+(centroid[0])+' '+(centroid[1])+ ')'
              }

            itemGroup.append('text')
                .attr('dy', 5)
                .attr('text-anchor', 'middle')
                .attr('transform', str)
                .attr('x', 0.95*centroid[0] * 1)
                .attr('y', 0.95*centroid[1] * 1)
                .text(menuItem);
        });
    };
    
    

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
            return data;
        } catch (error) {
            console.error('Error fetching relations:', error);
        }
    };

    // draw relationship
    const drawRelations = (data,sourceNode) => {
        const svg = d3.select(svgRef.current);
        const g = svg.select('g');
        // clean target nodes and links
        g.selectAll('.target-node').remove();
        g.selectAll('.link').remove();

    console.log("source node")
    console.log(sourceNode.x)
    console.log(sourceNode)

    /*const relations = data.map(item => ({
        source: sourceNode.name,
        target: item.node.name,
    }));*/

    const relations = data.map(item => {
        //console.log("Current item:", item);
        return {
            source: sourceNode.name,
            target: item.node.name,
        };
    });
    

    const links = relations.map(r => ({
        source: r.source,
        target: r.target,
    }));

    const targetNodes = data.map(item => ({
        name: item.node.name,
        x: Math.random() * svg.node().clientWidth, //random position
        y: Math.random() * svg.node().clientHeight,
    }));
    // target nodes may not have some porperties, after add to nodes, need to update force graph
    //nodes.push(...targetNodes)
    //simulation.nodes(nodes); // Update simulation with the new nodes
    //simulation.alpha(1).restart(); // Restart the simulation

     // draw target node
     const targetNode = g.selectAll('.target-node')
     .data(targetNodes)
     .enter()
     .append('g')
     .attr('class', 'target-node')
     .attr('transform', d => `translate(${d.x}, ${d.y})`);


    // draw relationship
    const link = g.selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-width', 2)
        .attr('x1', sourceNode.x)
        .attr('y1', sourceNode.y) 
        .attr('x2', d => {
                    //return d.target.x;
                    const targetNodeData = targetNodes.find(node => node.name === d.target);
                    return targetNodeData ? targetNodeData.x : 0;
                }) 
        .attr('y2', d => {
                    //return d.target.y;
                    const targetNodeData = targetNodes.find(node => node.name === d.target);
                    return targetNodeData ? targetNodeData.y : 0;
                });

    targetNode.append('circle')
        .attr('r', 20)
        .attr('fill', '#ff6347');

    targetNode.append('text')
        .text(d => d.name)
        .attr('dx', 10)
        .attr('dy', 3);
        console.log("Drawing relations:", data);
    };

    // initialize the force-directed graph
    const initializeGraph = () => {
        const svg = d3.select(svgRef.current);
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;

        const menuItems = ['SubGraph', 'Action 2', 'Action 3'];
        var links;
        console.log("nodes1")
        console.log(nodes)
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

        simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(-50))  // repulsive force between nodes
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30))  // avoid overlap
            .on('tick', ticked);  // update node position

        // drap behavior
        //TODO: add flag to determine single node/ subgraph
        const drag = d3.drag()
            .on('start', (event, d) => {
                event.sourceEvent.stopPropagation();  // stop zoom
                if (!event.active) simulation.alphaTarget(0.1).restart();  // define alpha
                d.fx = d.x;  // fixed x
                d.fy = d.y;
                console.log("start")
            })
            .on('drag', (event, d) => {
                d.fx = event.x;  // update x
                d.fy = event.y;
                //drawMenu(d, menuItems, g);  // draw menu every time
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
            .attr('r', 50)
            .attr('fill', '#69b3a2')
            .on('click', (event, d) =>{ 
                handleNodeClick(d);
                drawMenu(d,menuItems,g);
                console.log("relations")
                console.log(links);
                /*console.log("step2")
                const groups = d3.selectAll('svg g');
                    groups.each(function() {
                    console.log(this);
                });*/
                //showButton(d);
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

            // update menu item position according to node
            g.selectAll('.menu-item').each(function(d) {
                const itemGroup = d3.select(this);
                itemGroup.attr('transform', `translate(${d.x}, ${d.y})`);
            });
            g.selectAll('.link').each(function(d){
                console.log("moving")
                console.log(d)
                const sourceNode = nodes.find(node => node.name === d.source); // Get source node data
            //const targetNode = nodes.find(node => node.name === d.target); // Get target node data
            
                if (sourceNode) {
                    d3.select(this)
                        .attr('x1', sourceNode.x)  // Source node x
                        .attr('y1', sourceNode.y)  // Source node y
                }
            })

            // update target node position
            //g.selectAll('.target-node')
            //.attr('transform', d => `translate(${d.x}, ${d.y})`);
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