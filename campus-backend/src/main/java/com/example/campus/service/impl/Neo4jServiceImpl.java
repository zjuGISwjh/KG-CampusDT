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

    public ArrayList<String> getAllLabel(){
        return neo4jRepository.getAllLabels();
    }

    @Override
    public ArrayList<String> getAllRelationshipType() {
        return neo4jRepository.getAllRelationshipType();
    }

    public List<Map<String,Object>> getNode(String nodeType, Map<String, String> parameters) {
        return neo4jRepository.getNode(nodeType,parameters);
    }

    public List<Map<String, Object>> getSubGraphA(String label,String id){
        return neo4jRepository.getSubGraphA(label,id);
    }

    public List<Map<String,Object>> getBusStopByRoute(String route){
        return neo4jRepository.getBusStopByRoute(route);
    }

    public List<Map<String,Object>> getNextStop(String busStopId){
        return neo4jRepository.getNextStop(busStopId);
    }
}
