package com.triceratops.dinocityserver.controllers;

import com.triceratops.dinocityserver.models.Park;
import com.triceratops.dinocityserver.models.ParkStats;
import com.triceratops.dinocityserver.services.ParkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/park")
public class ParkController {

    private ParkService parkService;

    @Autowired
    public ParkController(ParkService parkService) {
        this.parkService = parkService;
    }

    @RequestMapping(value = "/name/{name}", method = RequestMethod.GET)
    public Park getPark(@PathVariable String name) {
        return parkService.getParkByName(name);
    }

    @RequestMapping(value = "/stats/name/{name}", method = RequestMethod.GET)
    public ParkStats getParkStats(@PathVariable String name) {
        return parkService.getParkStats(name);
    }

    @RequestMapping(value="/new/{name}",method = RequestMethod.GET)
    public Park addPark(@PathVariable String name){
        return parkService.addPark(name);
    }
}
