package com.example.campus.controller;

import com.alibaba.fastjson2.JSONObject;
import com.example.campus.service.Neo4jService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class Neo4jController {

    @Autowired
    private Neo4jService neo4jService;
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @RequestMapping(value = "/getAllLabel", method = RequestMethod.GET)
    @ResponseBody
    public ArrayList<String> getAllLabel() {
        logger.info("start invoke getAllLabel()");
        return neo4jService.getAllLabel();
    }

    @RequestMapping(value = "/getAllRelationshipType", method = RequestMethod.GET)
    @ResponseBody
    public ArrayList<String> getAllRelationshipType() {
        logger.info("start invoke getAllRelationshipType()");
        return neo4jService.getAllRelationshipType();
    }

    //get geo-entity node, including building,parkinglot,bus_stop,etc
    @RequestMapping(value = "/getEntityNode", method = RequestMethod.POST)
    @ResponseBody
    public List<Map<String,Object>> getEntityNode(@RequestParam(value = "nodeType") String nodeType, @RequestBody Map<String, String> parameters) {
        logger.info("start invoke getEntityNode()");
        return neo4jService.getNode(nodeType,parameters);
    }

    //get subgraph of (a)-[r]->(b), label and id to determine the specific node A(label,id)
    @RequestMapping(value = "/getSubGraphA", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getSubGraphA(@RequestParam(value = "label")String label,@RequestParam(value = "id") String id) {
        logger.info("start invoke getSubGraphA()");
        return neo4jService.getSubGraphA(label,id);
    }

    // get bus stop by route
    @RequestMapping(value = "/getBusStopByRoute", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getBusStopByRoute(@RequestParam(value = "route")String route) {
        logger.info("start invoke getBusStopByRoute()");
        return neo4jService.getBusStopByRoute(route);
    }

    //get next bus stop
    @RequestMapping(value = "/getNextStop", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getNextStop(@RequestParam(value = "busStopId")String busStopId) {
        logger.info("start invoke getNextStop()");
        return neo4jService.getNextStop(busStopId);
    }
}
