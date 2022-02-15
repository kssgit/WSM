package com.project.controller.cmn;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.ibatis.session.SqlSession;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.spring.UIView;

//
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Calendar;
import java.io.BufferedReader;
import java.io.IOException;


@Controller
public class indexController {
	
	
	/**
	  * @Method Name : index
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : session 존재 유무에 따른 로그인 페이지 및 메인페이지 이동
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("index.do")
	public View index(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		HttpSession session =req.getSession(false); // session 값이 있다면 값 반환 , 없다면 null 반환

		if(session != null && session.getAttribute("USER_NAME") != null) {
//			System.out.println(session.getAttribute("USER_KIND"));
			return new UIView("ui/0_main/main_page"); // 메인페이지
		
		}

		return new UIView("ui/0_main/login");// session에 정보가 없다면 로그인 페이지
	}
}
