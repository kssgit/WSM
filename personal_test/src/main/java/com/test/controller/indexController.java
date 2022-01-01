package com.test.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.spring.UIView;

@Controller
public class indexController {
	
	@RequestMapping("index.do")
	public View index(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		return new UIView("ui/test");
	}
}
