package com.example.campus.repository;

import com.alibaba.fastjson2.JSONObject;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.neo4j.driver.Result;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.neo4j.driver.Values.parameters;

@Component
public class Neo4jRepository {
    private static Driver driver;

    @Autowired
    public Neo4jRepository(Driver driver) {
        Neo4jRepository.driver = driver;
    }

    public static JSONObject recordToJson(Record record) {
        JSONObject jsonObject = new JSONObject();
        for (String key : record.keys()) {
            jsonObject.put(key, record.get(key).asObject());  // use asObject() for generic values
        }
        return jsonObject;
    }

    //get all labels
    public static ArrayList<String> getAllLabels(){
        ArrayList<String> finalResult=new ArrayList();

        Session session = driver.session();
        String cql ="CALL db.labels() YIELD label RETURN label";
        Result result = session.run(cql);
        while (result.hasNext()) {
            Record record = result.next();
            JSONObject jsonObject = recordToJson(record);
            finalResult.add(jsonObject.get("label").toString());
        }
        return finalResult;
    }

    public List<Map<String,Object>> getNodeByLabel(String label){
        ArrayList<Map<String, Object>> finalResult=new ArrayList();
        Session session = driver.session();
        String cql="MATCH (n:"+label+") RETURN n";
        Result result = session.run(cql);

        while (result.hasNext()) {
            Record record = result.next();
            finalResult.add(record.get("n").asMap());
        }

        return finalResult;
    }

    //get the geometry and properties, construct into geojson
    public static JSONObject getNodeAndGeometryByLabel(String label){
        //ArrayList<Map<String, Object>> finalResult=new ArrayList();
        JSONObject finalResult=new JSONObject();
        ArrayList<Map<String, Object>> features=new ArrayList();
        String labelid=label+"_id";
        Session session = driver.session();
        /*String cql = "MATCH (a:"+label+") " +
                "OPTIONAL MATCH (a)-[:has_geometry]->(b) " +
                "RETURN a, b";*/
        String cql="MATCH (a:"+label+") " +
                "OPTIONAL MATCH (a)-[:has_geometry]->(b:"+label+"_geometry) " +
                "WITH a, b, apoc.convert.fromJsonList(b.coordinates) AS parsedCoordinates " +
                "RETURN a {    .*}, b {    .*, coordinates: parsedCoordinates};";
        Result result = session.run(cql);

        while (result.hasNext()) {
            Record record = result.next();
            Map<String, Object> pair = new HashMap<>();
            pair.put("type","Feature");
            pair.put("id",record.get("a").asMap().get(labelid));
            pair.put("properties", record.get("a").asMap());
            pair.put("geometry", record.get("b").asMap());
            features.add(pair);
        }
        finalResult.put("type","FeatureCollection");
        finalResult.put("features",features);
        return finalResult;
    }

    //get all relationTypes
    public static ArrayList<String> getAllRelationshipType(){
        ArrayList<String> finalResult=new ArrayList();

        Session session = driver.session();
        String cql ="CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType";
        Result result = session.run(cql);
        while (result.hasNext()) {
            Record record = result.next();
            JSONObject jsonObject = recordToJson(record);
            finalResult.add(jsonObject.get("relationshipType").toString());
        }
        return finalResult;
    }

    public static List<Map<String, Object>> getSingleNode(String label,String id){

        ArrayList<Map<String, Object>> finalResult=new ArrayList();
        String labelid=label+"_id";
        String cql = "MATCH (n:"+label+" {"+labelid+": $id}) RETURN n";

        Session session = driver.session();
        Result result = session.run(cql,parameters("label", label, "id", id));
        while (result.hasNext()) {
            Record record = result.next();
            finalResult.add(record.get("n").asMap());
        }
        return finalResult;
    }

    //get node by query criteria
    public static List<Map<String, Object>> getNode(String nodeType,Map<String, String> parameters){
        ArrayList<Map<String, Object>> finalResult=new ArrayList();

        Session session = driver.session();
        StringBuilder cql = new StringBuilder("MATCH (n:"+nodeType+") WHERE ");
        // dynamic build query criteria
        List<String> conditions = new ArrayList<>();
        Map<String, Object> params = new HashMap<>();
        parameters.forEach((key, value) -> {
            // range query for year
            if(key.equals("start_year")){
                conditions.add("n.year_built >= $" + key);
            }
            else if(key.equals("end_year")){
                conditions.add("n.year_built <= $" + key);
            }
            else {
                // default property
                // build query criteria for each <key,value>
                conditions.add("n." + key + " = $" + key);
            }
            params.put(key, value);
        });
        // build Cypher query string
        cql.append(String.join(" AND ", conditions));
        cql.append(" RETURN n");
        System.out.println("cql:"+cql);
        Result result = session.run(cql.toString(),params);
        // turn result into list
        while (result.hasNext()) {
            Record record = result.next();
            finalResult.add(record.get("n").asMap());
        }
        //finalResult.add(recordToJson(record));
        return finalResult;
    }

    //get relationship by query criteria
    public static List<Map<String, Object>> getRelationship(String relationshipType,Map<String, String> parameters){
        List<Map<String, Object>> finalResult = new ArrayList<>();

        Session session = driver.session();

        return finalResult;
    }

    //get node a and b when relationship r exists



    //get node 'a' and all node b/relationship r when exists (a)-[r]->(b)
    //result include type of relationship r and label of node b
    public static List<Map<String, Object>> getSubGraphA(String label,String id){
        List<Map<String, Object>> finalResult = new ArrayList<>();
        String labelid=label+"_id";
        String cql = "MATCH (a:"+label+" {"+labelid+": $id})-[r]->(b) " +
                "RETURN type(r) AS relationshipType, b";

        Session session = driver.session();
        Result result = session.run(cql,parameters("label", label, "id", id));
        while (result.hasNext()) {
            Record record = result.next();
            Map<String, Object> rbPair = new HashMap<>();
            rbPair.put("relationship", record.get("relationshipType").asString());
            rbPair.put("node",record.get("b").asMap());
            rbPair.put("label",record.get("b").asNode().labels());
            finalResult.add(rbPair);
        }
        return finalResult;
    }

    //get single geometry
    public static List<Map<String, Object>> getGeometry(String label,String id){
        List<Map<String, Object>> finalResult = new ArrayList<>();
        String labelid=label+"_id";
        String cql="MATCH (n:"+label+" {"+labelid+":$id)-[r:has_geometry]->(b) "+
                "RETURN b";
        Session session = driver.session();
        Result result = session.run(cql,parameters("label", label, "id", id));
        while (result.hasNext()) {
            Record record = result.next();
            finalResult.add(record.get("b").asMap());
        }
        return finalResult;
    }

    //get bus stops and their geometry by route
    public static JSONObject getBusStopByRoute(String route){
        JSONObject finalResult = new JSONObject();
        ArrayList<Map<String, Object>> features=new ArrayList();
        //String cql="MATCH (n:bus_stop) WHERE n.route = $route RETURN n";
        String cql="MATCH (a:bus_stop) WHERE a.route = $route " +
                "OPTIONAL MATCH (a)-[:has_geometry]->(b:bus_stop_geometry) " +
                "WITH a, b, apoc.convert.fromJsonList(b.coordinates) AS parsedCoordinates " +
                "RETURN a {    .*}, b {    .*, coordinates: parsedCoordinates};";


        Session session = driver.session();
        Result result = session.run(cql,parameters("route", route));
        while (result.hasNext()) {
            Record record = result.next();
            Map<String, Object> pair = new HashMap<>();
            pair.put("type","Feature");
            pair.put("id",record.get("a").asMap().get("bus_stop_id"));
            pair.put("properties", record.get("a").asMap());
            pair.put("geometry", record.get("b").asMap());
            features.add(pair);
        }
        finalResult.put("type","FeatureCollection");
        finalResult.put("features",features);
        return finalResult;
    }

    //get next bus stop
    public static List<Map<String, Object>> getNextStop(String busStopId){
        List<Map<String, Object>> finalResult = new ArrayList<>();
        String cql="MATCH (n:bus_stop {bus_stop_id:$busStopId})-[r:next_stop]->(b) RETURN b";
        Session session = driver.session();
        Result result = session.run(cql,parameters("busStopId", busStopId));
        while (result.hasNext()) {
            Record record = result.next();
            finalResult.add(record.get("b").asMap());
        }
        return finalResult;
    }

    // recursively query the remaining stops on the route
    public static List<Map<String, Object>> getNextStops(String route,String busStopName){
        List<Map<String, Object>> finalResult = new ArrayList<>();
        String cql="MATCH (start:bus_stop {name:$busStopName,route:$route})-[:next_stop*]->(next_stops)" +
                "RETURN next_stops";
        Session session = driver.session();
        Result result = session.run(cql,parameters("busStopName", busStopName, "route", route));
        while (result.hasNext()) {
            Record record = result.next();
            finalResult.add(record.get("next_stops").asMap());
        }
        return finalResult;
    }

    // get parkinglot on street
    public static List<Map<String, Object>> getParkinglotOnStreet(String street){
        List<Map<String, Object>> finalResult = new ArrayList<>();
        String cql="MATCH (n:parkinglot)-[r:locate_on]->(b:street {name:$streetName}) RETURN n";
        Session session = driver.session();
        Result result = session.run(cql,parameters("streetName", street));
        while (result.hasNext()) {
            Record record = result.next();
            finalResult.add(record.get("n").asMap());
        }
        return finalResult;
    }
}
