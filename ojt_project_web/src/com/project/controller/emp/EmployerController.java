package com.project.controller.emp;


import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.DataResponse;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.protocol.data.ParameterRow;
import com.cleopatra.spring.JSONDataView;
import com.project.dao.emp.EmployerDao;


/**
  * @FileName : EmployerController.java
  * @Project : ojt_project_web
  * @Date : 2022. 1. 25. 
  * @작성자 : SeongSoo
  * @변경이력 :
  * @프로그램 설명 : 고용주 Controller
  * 총 18개 함수
  */
@Controller
@RequestMapping("emp")
public class EmployerController {
	

	private final EmployerDao dao;
	/**
	 * 생성자
	 * @param service
	 */
	@Autowired
	public EmployerController(EmployerDao dao) {
		// TODO Auto-generated constructor stub

		this.dao = dao;
	}
	
	
	
	
	/**
	  * @Method Name : onLoad
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주 메인 페이지 로드 시 매장 리스트 및 스케줄 정보 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/onLoad.do")
	public View onLoad(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		if(param != null) {
			String USER_EMAIL = param.getValue("USER_EMAIL");
			String USER_NUMBER =param.getValue("USER_NUMBER");
			//매장 리스트 
			List storeList = dao.storeList(USER_NUMBER,null,null);
			//매장 스케줄 리스트
			List storeScheduleList = dao.storeScheduleList(USER_EMAIL);

			dataRequest.setResponse("dsStoreList", storeList);
			dataRequest.setResponse("dsEvnt", storeScheduleList);		
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : storeList
	  * @작성일 : 2022. 1. 27.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 사원이 매장을 연결하기위해 고용주의 아이디로 매장 리스트 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/ptjstoreList.do")
	public View storeList(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{ 
		ParameterGroup param = dataRequest.getParameterGroup("dmEmpInfo");
		if(param != null ) {
			List storeList = dao.storeList(null, param.getValue("user_id"),param.getValue("user_code_ptj"));

			dataRequest.setResponse("dsStoreList", storeList);
		}
		
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : addStore
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 추가
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/addStore.do")
	public View addStore(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmAddStore");
		if(param != null){
			int result = dao.addStore(param);
			if(result != 1) {
				// 오류 메시지 발생
			}

		}
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : getPtjList
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 직원 목록 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/getPtjList.do")
	public View getPtjList(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmGetPtjList");
		if(param != null){
			String storeCode = param.getValue("STORE_CODE"); 
			String userNumber = param.getValue("USER_NUMBER");
			String ptj_name = param.getValue("PTJ_NAME");
			
			List<Map<String, Object>> result = dao.getPtjList(storeCode, userNumber,ptj_name);

			dataRequest.setResponse("dsPtjList", result);
		}		
		return new JSONDataView();
	}
	
	
	
	/**
	 * @Method Name : getSchedule
	 * @작성일 : 2022. 1. 25.
	 * @작성자 : KyeongSu
	 * @변경이력 : 
	 * @Method 설명 : 직원별 스케줄 목록 조회
	 * @param req
	 * @param res
	 * @param dataRequest
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/getSchedule.do")
	public View getSchedule(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmGetSchedule");
		if(param != null) {
			
			List<Map<String, Object>> result = dao.getschedule(param);
			
			//페이지 인덱서 
			List page = pageIndex(param, result);
			
			Map<String, String > dm = param.getSingleValueMap();
			dm.put("totalRowCount", Integer.toString(result.size()));
			
			dataRequest.setResponse("dmGetSchedule", dm);
			dataRequest.setResponse("dsSchedule", result);
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : requestList
	  * @작성일 : 2022. 2. 15.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 연결 요청 목록 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestList.do")
	public View requestList(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmSearch");
		if(param != null) {
			String USER_NUMBER = param.getValue("USER_NUMBER");
			String STORE_CODE =param.getValue("STORE_CODE");
			String PTJ_NAME = param.getValue("PTJ_NAME");
			
			//매장 연결 요청 목록 조회
			List requestList = dao.getRequestList(USER_NUMBER,STORE_CODE,PTJ_NAME);
			
			dataRequest.setResponse("dsRequest", requestList);
		}
		
			
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : acceptPtjRequest
	  * @작성일 : 2022. 2. 3.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생 매장등록 요청 수락 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/acceptPtjRequest.do")
	public View acceptPtjRequest(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{

		ParameterGroup param = dataRequest.getParameterGroup("dmUpdate");
		if(param != null) {
			dao.updatePtLinkjRequest(param);
			
		}
		
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : requestPtjSchedule
	  * @작성일 : 2022. 2. 3.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주가 알바생 근무일정 변경 및 추가 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestPtjSchedule.do")
	public View requestPtjSchedule(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dsSchedule");
		
		if(param != null) {
			Iterator<ParameterRow> iter;
			//delete
			iter = param.getDeletedRows();
			while(iter.hasNext()) {
				dao.reqDeleteWork(iter.next().toMap());
			}
			
			iter = param.getInsertedRows();
			//Insert
			while(iter.hasNext()) {
				dao.reqCreateWork(iter.next().toMap());
			}
			
			//update
			iter = param.getUpdatedRows();
			while(iter.hasNext()) {
				dao.reqUpdateWork(iter.next().toMap());
			}
		}
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : scheduleChangeList
	  * @작성일 : 2022. 2. 6.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 스케줄 변경 요청 리스트 (고용주)
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/scheduleChangeList.do")
	public View scheduleChangeListEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		if(param != null) {
			List changeList = dao.getscheduleChange(param.getValue("USER_EMAIL"),param.getValue("STORE_CODE"), param.getValue("PTJ_NAME"));

			dataRequest.setResponse("dsScheduleChange", changeList);
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : requestScheduleChange
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주가 요청한 근무 스케줄 목록
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestScheduleChange.do")
	public View requestScheduleChangeEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		if(param != null) {
			List reqChangeList = dao.getReqList(param.getValue("USER_EMAIL"),param.getValue("USER_KIND"),param.getValue("STORE_CODE"), param.getValue("PTJ_NAME"));
			
			dataRequest.setResponse("dsRequest", reqChangeList);
		}
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : selectedChangeSchedul
	  * @작성일 : 2022. 2. 7.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 선택한 요청 근무일자에 해당하는 스케줄 정보 확인
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/selectedChangeSchedul.do")
	public View selectedChangeSchedulEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmSelectRow");
		if(param != null) {
			List daySchedule = dao.getDaySchedule(param.getValue("WORK_DATE"),param.getValue("STORE_CODE"));
			List ptjList = dao.getPtjList(param.getValue("STORE_CODE"));
			
			dataRequest.setResponse("dsPtjList", ptjList);
			dataRequest.setResponse("dsSelectSchedule", daySchedule);
		}
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : saveAcceptSchedule
	  * @작성일 : 2022. 2. 7.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생이 요청한 근무일자에 대한 승인 여부 저장
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/saveAcceptSchedule.do")
	public View saveAcceptScheduleEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dsScheduleChange");
		Map<String, Integer > exception = new HashMap<String, Integer>();
		if(param != null ) {
			Iterator<ParameterRow> iter;
			
			iter = param.getUpdatedRows();
			while(iter.hasNext()) {
				int result = dao.updateAcceptScheduleChange(iter.next().toMap());
				if(result == 1) { // 시간 중복 발생으로 해당 요천 근무는 거절 됨
					exception.put("message", 1);
					dataRequest.setResponse("dmException", exception);
				}
			}
		}
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : updaterequestChange
	  * @작성일 : 2022. 2. 7.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주가 자신이 요청 목록 삭제
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
				dao.deleteRequestChange(iter.next().toMap());
			}
		}
		
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : checkReqResList
	  * @작성일 : 2022. 2. 28.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주가 승인 또는 거절한 요청스케줄 목록
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/checkReqResList.do")
	public View checkReqResList(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");

		if(param != null) {

			List result = dao.getcheckReqResList(param.getValue("USER_EMAIL"),param.getValue("STORE_CODE"),param.getValue("PTJ_NAME"));
			
			//페이지 인덱서 
			List page = pageIndex(param, result);
			
			Map<String, String > dm = param.getSingleValueMap();
			dm.put("totalRowCount", Integer.toString(result.size()));
			
			dataRequest.setResponse("dmOnLoad", dm);
			dataRequest.setResponse("dsCheckReqRes", page);
		}
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : ptjDelete
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 직원 퇴사 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/ptjDelete.do")
	public View ptjDelete(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmPtjDelete");
		if(param != null) {			
			dao.deletePtj(param.getValue("PTJ_CODE"),param.getValue("USER_CODE_PTJ"));
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : checkSchedule
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 선택한 스케줄이 현재 변경,삭제 요청중인지 확인 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/checkSchedule.do")
	public View checkSchedule(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmCheckUD");
		if(param != null ) {			
			int result = dao.checkSchedule(param.getValue("SCHEDULE_CODE"));
			Map<String, Integer> dm = new HashMap<String, Integer>();
			dm.put("RESULT", result);
			dataRequest.setResponse("dmCheckUD", dm);
		}
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : deleteStore
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 삭제
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/deleteStore.do")
	public View deleteStore(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmDeleteStore");
		if(param != null ) {
			dao.deleteStore(param.getValue("STORE_CODE"), param.getValue("USER_NUMBER"));			
		}
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : updatePartTimer
	  * @작성일 : 2022. 2. 23.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 근무자 정보 변경
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/updatePtj.do")
	public View updatePartTimer(HttpServletRequest req, HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmUpdate");
		if(param != null ) {
			dao.updatePartTimer(param.getValue("PTJ_CODE"), param.getValue("COLOR"),param.getValue("ROLE"));			
		}
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : pageIndex
	  * @작성일 : 2022. 3. 2.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 페이지 인덱서 함수
	  * @param param
	  * @param result
	  * @return
	  */
	public List pageIndex(ParameterGroup param , List result) {
		
		//페이지 인덱서 
		int totalRowCount = result.size(); // 총 데이터 개수
		int pageRowCount = 30; // 한페이지에 보여줄 데이터 수 

		int start_index = 0; // 시작 index 값
		int end_index = totalRowCount;// 종료 index 값
		List page = new ArrayList<Map<String, String>>();
		int currpage =1;
		
		if(param.getValue("currpage") != null && param.getValue("currpage") != "" ) {
			currpage= Integer.parseInt(param.getValue("currpage"));//현재 페이지 index
			start_index = (currpage-1)*pageRowCount;
			if(totalRowCount >= currpage*pageRowCount ) {
				end_index = currpage*pageRowCount;					
			}
		}else {//처음 데이터를 받아올경우(currpage 가 1인 경우)
			start_index = (currpage-1)*pageRowCount;
			if(totalRowCount >= currpage*pageRowCount ) {
				end_index = currpage*pageRowCount;					
			}
		}
		
		//해당 범위값에 해당하는 로우 값들을 새로운 List에 추가
		for(int i = start_index ; i < end_index ; i++) {
			page.add(result.get(i));
		}		
		
		return page;
	}
	
}
