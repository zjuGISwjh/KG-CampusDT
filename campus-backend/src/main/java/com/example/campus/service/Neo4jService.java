package com.example.campus.service;

import com.alibaba.fastjson2.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public interface Neo4jService {

    ArrayList<String> getAllLabel();
    ArrayList<String> getAllRelationshipType();
    List<Map<String,Object>> getNode(String nodeType,Map<String, String> parameters);
    List<Map<String, Object>> getSubGraphA(String label,String id);
    List<Map<String, Object>> getBusStopByRoute(String route);
    List<Map<String, Object>> getNextStop(String busStopId);
}
