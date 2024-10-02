package com.example.campus.service.impl;

import com.alibaba.fastjson2.JSONObject;
import com.example.campus.repository.Neo4jRepository;
import com.example.campus.service.Neo4jService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class Neo4jServiceImpl implements Neo4jService {
    @Autowired
    private Neo4jRepository neo4jRepository;

    @Override
    public ArrayList<String> getAllLabel(){
        return neo4jRepository.getAllLabels();
    }

    @Override
    public List<Map<String,Object>> getNodeByLabel(String label){
        return neo4jRepository.getNodeByLabel(label);
    }

    @Override
    public JSONObject getNodeAndGeometryByLabel(String label){
        return neo4jRepository.getNodeAndGeometryByLabel(label);
    }

    @Override
    public ArrayList<String> getAllRelationshipType() {
        return neo4jRepository.getAllRelationshipType();
    }

    @Override
    public List<Map<String, Object>> getSingleNode(String label,String id){
        return neo4jRepository.getSingleNode(label,id);
    }

    @Override
    public List<Map<String,Object>> getNode(String nodeType, Map<String, String> parameters) {
        return neo4jRepository.getNode(nodeType,parameters);
    }

    @Override
    public List<Map<String, Object>> getSubGraphA(String label,String id){
        return neo4jRepository.getSubGraphA(label,id);
    }

    @Override
    public List<Map<String, Object>> getGeometry(String label,String id){
        return neo4jRepository.getGeometry(label,id);
    }

    @Override
    public JSONObject getBusStopByRoute(String route){
        return neo4jRepository.getBusStopByRoute(route);
    }

    @Override
    public List<Map<String,Object>> getNextStop(String busStopId){
        return neo4jRepository.getNextStop(busStopId);
    }

    @Override
    public List<Map<String,Object>> getNextStops(String route,String busStopName){
        return neo4jRepository.getNextStops(route,busStopName);
    }

    @Override
    public List<Map<String, Object>> getParkinglotOnStreet(String street){
        return neo4jRepository.getParkinglotOnStreet(street);
    }
}
