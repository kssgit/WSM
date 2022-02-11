package com.project.controller.ptj;


import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.protocol.data.ParameterRow;
import com.cleopatra.spring.JSONDataView;
import com.project.service.ptj.PtjService;


/**
  * @FileName : PtjController.java
  * @Project : ojt_project_web
  * @Date : 2022. 1. 25. 
  * @작성자 : SeongSoo
  * @변경이력 :
  * @프로그램 설명 : 알바생 컨트롤러
  */
@Controller
@RequestMapping("ptj")
public class PtjController {

	
	private final PtjService serivce;
	
	/**
	 * 생성자
	 * @param serivce
	 */
	@Autowired
	public PtjController(PtjService serivce) {
		// TODO Auto-generated constructor stub
		this.serivce = serivce;
	}
	
	
	/**
	  * @Method Name : onload
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생 메인페이지 생성시 실행
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/onLoad.do")
	public View onload(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmOnLoad");
//		System.out.println(param);
		List workList = serivce.worktimeList(param.getValue("user_code_ptj"));
		System.out.println(workList.toString());
		dataReq.setResponse("dsEvnt", workList);
		
		Map<String, String> dmRes = new HashMap<String, String>();
		dmRes.put("local", "en");
		dmRes.put("dayOfWeekFom", "short");
		
		dataReq.setResponse("dmRes", dmRes);
		
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : dailySchedule
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생 근무 스케줄 조회
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/dailySchedule.do")
	public View dailySchedule(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmDailySchedule");
		System.out.println(param);

		String work_date = param.getValue("work_date");
		String format_date = work_date.substring(0, 4) + "-" + work_date.substring(4,6) + "-" + work_date.substring(6);
		List workList = serivce.dayWorkTimeList(param.getValue("user_code_ptj"),format_date);
		System.out.println("성공 : " + workList.toString());
		
		dataReq.setResponse("dsDailySchedule", workList);
		
		return new JSONDataView();
	}
	
	@RequestMapping("/dailyScheduleReq.do")
	public View dailyScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmDailySchedule");
		String user_code_ptj = param.getValue("user_code_ptj");
		String work_date = param.getValue("work_date");
		String format_date = work_date.substring(0, 4) + "-" + work_date.substring(4,6) + "-" + work_date.substring(6);
		List workList = serivce.dailyScheduleReq(user_code_ptj,format_date);
		
		dataReq.setResponse("dsDailyScheduleReq", workList);
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : workPlace
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 근무지리스트 조회
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/workplace.do")
	public View workPlace(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmUserInfo");
		System.out.println(param);
		List workPlaceList = serivce.workPlace(Integer.parseInt(param.getValue("user_code_ptj")));
		System.out.println(workPlaceList.toString());
		dataReq.setResponse("dsWpName", workPlaceList);
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : linkRequest
	  * @작성일 : 2022. 1. 27.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 연결 요청
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/storeLinkRequest.do")
	public View linkRequest(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		ParameterGroup param = dataReq.getParameterGroup("dmRequseLink");
		int result = serivce.linkRequst(param);
		
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : scheduleChangeList
	  * @작성일 : 2022. 2. 6.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 스케줄 변경 요청 목록 조회(알바생)
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/scheduleChangeList.do")
	public View scheduleChangeList(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		ParameterGroup param = dataReq.getParameterGroup("dmOnLoad");
		
		List changelist = serivce.getScheduleChange(param.getValue("USER_NUMBER"));
		
		dataReq.setResponse("dsScheduleChange", changelist);
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : addNewScheduleReq
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 신규 스케줄 등록 요청
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/addNewScheduleReq.do")
	public View addNewScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmNewSchedule");
		serivce.addNewScheduleReq(param);
		
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : requestScheduleChange
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생이 요청한 근무 스케줄 목록
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestScheduleChange.do")
	public View requestScheduleChange(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		System.out.println(param.toString());
		List reqChangeList = serivce.getReqList(param.getValue("USER_NUMBER"),param.getValue("USER_KIND"));
		System.out.println(reqChangeList.toString());
		dataRequest.setResponse("dsRequest", reqChangeList);
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : selectedChangeSchedulEmp
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 선택한 근무일자에 해당하는 스케줄 리스트
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/selectedChangeSchedul.do")
	public View selectedChangeSchedulEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmSelectRow");
		
		List daySchedule = serivce.getDaySchedule(param.getValue("WORK_DATE"),param.getValue("USER_NUMBER"));
		System.out.println(dataRequest.toString());
		dataRequest.setResponse("dsSelectSchedule", daySchedule);
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : updaterequestChangeEmp
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 요청한 목록 삭제 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/updaterequestChange.do")
	public View updaterequestChangeEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dsRequest");
		
		if(param != null) {
			Iterator<ParameterRow> iter;
			
			iter = param.getDeletedRows();
			while(iter.hasNext()) {
				serivce.deleteRequestChange(iter.next().toMap());
			}
		}
		
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : updateScheduleReq
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 스케줄 변경 요청 (알바생)
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/updateScheduleReq.do")
	public View updateScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmUpdateSchedule");
		serivce.updateScheduleReq(param);
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : deleteScheduleReq
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 요청한 근무 스케줄 삭제
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/deleteScheduleReq.do")
	public View deleteScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmUpdateSchedule");
		serivce.deleteScheduleReq(param);
		
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : deleteStore
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 근무지 삭제
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/deleteStore.do")
	public View deleteStore(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		ParameterGroup param = dataReq.getParameterGroup("dmDeleteStore");
		System.out.println(param);
		serivce.deleteStore(param.getValue("STORE_CODE"),param.getValue("USER_NUMBER"));
		
		
		return new JSONDataView();
	}
	
	@RequestMapping("/saveAcceptSchedule.do")
	public View saveAcceptSchedule(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dsScheduleChange");
		
		if(param != null) {
			Iterator<ParameterRow> iter;
			
			iter = param.getUpdatedRows();
			while(iter.hasNext()) {
				serivce.saveAcceptSchedule(iter.next().toMap());
			}
		}
		
		
		return new JSONDataView();
	}
}