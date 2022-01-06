package com.test.controller;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.protocol.data.ParameterRow;
import com.cleopatra.spring.JSONDataView;
import com.test.dao.UserDao;

@Controller
@RequestMapping("/user")
public class userController {
	
	private Logger logger = LogManager.getLogger(userController.class);
	

	private final UserDao userdao;
	
	@Autowired
	public userController(UserDao userdao) {
		this.userdao = userdao;
	}
	
	@RequestMapping("/load.do")
	public View getSearchEmail(HttpServletRequest request , HttpServletResponse response, DataRequest datarequest) throws Exception{
		
		ParameterGroup param = datarequest.getParameterGroup("dmEmail");
		
//		System.out.println(request.getAttribute("com.cleopatra.data_request"));
		
		Map<String , Object> paramMap = new HashMap<String, Object>();
		
		// 유효성 검사 
		if(param != null) {
			String email = param.getValue("EMAIL");

			if(email != null && !"".equals(email)) {
				paramMap.put("EMAIL", email);
				
			}
		}

		
		List<Map<String, Object>> getsearchEmailList = this.userdao.getSearchEmailList(paramMap);
		datarequest.setResponse("dsList", getsearchEmailList);
		
		return new JSONDataView();
	}
	
	@RequestMapping("/save.do")
	public View save(HttpServletRequest request , HttpServletResponse response, DataRequest datarequest) throws Exception{
		
		ParameterGroup param = datarequest.getParameterGroup("dsList");
		
		Map<String , Object> paramMap = new HashMap<String, Object>();
		
		if(param != null) {
			Iterator<ParameterRow> iter;
			
			iter = param.getInsertedRows();
			while(iter.hasNext()) {
				this.userdao.insertUser(iter.next().toMap());
			}
			iter = param.getUpdatedRows();
			while(iter.hasNext()) {
				// 유효성 검사 EMAIL 값이 들어왔는지 
				
				this.userdao.updateUser(iter.next().toMap());	
			}
			iter = param.getDeletedRows();
			while(iter.hasNext()) {
				// 유효성 검사 EMAIL 값이 들어왔는지 
				
				this.userdao.deleteUser(iter.next().toMap());
			}
		}
		
		return new JSONDataView();
	}
}
