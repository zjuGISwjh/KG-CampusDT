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
    @CrossOrigin
    public ArrayList<String> getAllLabel() {
        logger.info("start invoke getAllLabel()");
        return neo4jService.getAllLabel();
    }

    //get all the nodes when label is "label"
    @RequestMapping(value = "/getNodeByLabel", method = RequestMethod.GET)
    @CrossOrigin
    public List<Map<String, Object>> getNodeByLabel(@RequestParam(value = "label") String label) {
        logger.info("start invoke getNodeByLabel()");
        return neo4jService.getNodeByLabel(label);
    }

    //for onlinemap, get the geometry and properties of geo entities by label
    @RequestMapping(value = "/getNodeAndGeometryByLabel", method = RequestMethod.GET)
    @CrossOrigin
    public JSONObject getNodeAndGeometryByLabel(@RequestParam(value = "label") String label) {
        logger.info("start invoke getNodeAndGeometryByLabel()");
        return neo4jService.getNodeAndGeometryByLabel(label);
    }

    @RequestMapping(value = "/getAllRelationshipType", method = RequestMethod.GET)
    @ResponseBody
    public ArrayList<String> getAllRelationshipType() {
        logger.info("start invoke getAllRelationshipType()");
        return neo4jService.getAllRelationshipType();
    }

    //get single geo-entity node
    @RequestMapping(value = "/getSingleNode", method = RequestMethod.GET)
    @ResponseBody
    @CrossOrigin
    public List<Map<String, Object>> getSingleNode(@RequestParam(value = "label")String label,@RequestParam(value = "id") String id) {
        logger.info("start invoke getSingleNode()");
        return neo4jService.getSingleNode(label,id);
    }

    //get geo-entity node, including building,parkinglot,bus_stop,etc
    //this one includes a json of guery parameters
    @RequestMapping(value = "/getEntityNode", method = RequestMethod.POST)
    @ResponseBody
    @CrossOrigin
    public List<Map<String,Object>> getEntityNode(@RequestParam(value = "nodeType") String nodeType, @RequestBody Map<String, String> parameters) {
        logger.info("start invoke getEntityNode()");
        return neo4jService.getNode(nodeType,parameters);
    }

    //get subgraph of (a)-[r]->(b), label and id to determine the specific node A(label,id)
    @RequestMapping(value = "/getSubGraphA", method = RequestMethod.GET)
    @ResponseBody
    @CrossOrigin
    public List<Map<String, Object>> getSubGraphA(@RequestParam(value = "label")String label,@RequestParam(value = "id") String id) {
        logger.info("start invoke getSubGraphA()");
        return neo4jService.getSubGraphA(label,id);
    }

    //get geometry of single geo entity
    @RequestMapping(value = "/getGeometry", method = RequestMethod.GET)
    @ResponseBody
    @CrossOrigin
    public List<Map<String, Object>> getGeometry(@RequestParam(value = "label")String label,@RequestParam(value = "id") String id) {
        logger.info("start invoke getGeometry()");
        return neo4jService.getGeometry(label,id);
    }

    // get bus stop by route
    @RequestMapping(value = "/getBusStopByRoute", method = RequestMethod.GET)
    @ResponseBody
    @CrossOrigin
    public JSONObject getBusStopByRoute(@RequestParam(value = "route")String route) {
        logger.info("start invoke getBusStopByRoute()");
        return neo4jService.getBusStopByRoute(route);
    }

    //get next bus stop
    @RequestMapping(value = "/getNextStop", method = RequestMethod.GET)
    @ResponseBody
    @CrossOrigin
    public List<Map<String, Object>> getNextStop(@RequestParam(value = "busStopId")String busStopId) {
        logger.info("start invoke getNextStop()");
        return neo4jService.getNextStop(busStopId);
    }

    // get parkinglot on street
    @RequestMapping(value = "/getParkinglotOnStreet", method = RequestMethod.GET)
    @ResponseBody
    @CrossOrigin
    public List<Map<String, Object>> getParkinglotOnStreet(@RequestParam(value = "street")String streetName) {
        logger.info("start invoke getParkinglotOnStreet()");
        return neo4jService.getParkinglotOnStreet(streetName);
    }
}
