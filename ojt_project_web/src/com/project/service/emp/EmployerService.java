package com.project.service.emp;

import java.util.List;
import java.util.Map;

import org.apache.commons.collections.map.HashedMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.dao.emp.EmployerDao;
import com.project.service.interfaces.EmployerServiceInterface;

@Service
public class EmployerService /* implements EmployerServiceInterface */ {

	@Autowired
	private EmployerDao dao;
	
//	@Override
//	public List storeList(String user_umber_emp,  String user_email, String user_code_ptj) {
//		Map<String,String> param = new HashedMap();
//		param.put("USER_NUMBER_EMP", user_umber_emp);
//		param.put("USER_EMAIL", user_email);
//		param.put("user_code_ptj", user_code_ptj);
//				
//		return dao.storeList(param);
//	}
//
//	@Override
//	public List storeScheduleList(String user_id) {
//		Map<String, String> param = new HashedMap();
//		param.put("USER_CODE_EMP", user_id);
////		return dao.storeScheduleList(param);
//		return new List;
//	}
//
//	@Override
//	public int addStore(Map<String, Object> storeData) {
//		// TODO Auto-generated method stub
////		return dao.addStore(storeData);
//		return 0;
//	}
	
	//직원 목록 조회
	public List<Map<String, Object>> getPtjList(String userNumber) {
		List result = dao.getPtjList(userNumber);
		return result;
	}

//	public List<Map<String, Object>> getschedule(Map<String, Object> scheduleData) {
//		List<Map<String, Object>> result = dao.getschedule(scheduleData);
//		return result;
//	}
	
	//매장 연결 요청 리스트 조회
	public List requsetList(String USER_NUMBER) {
		List<Map<String, Object>> result = dao.getRequestList(USER_NUMBER);
		return result;
	}
	
	//매장 연결 요청 업데이트 
	public int updatePtLinkjRequest(Map<String, String> map) {
		// TODO Auto-generated method stub
		
		return dao.updatePtLinkjRequest(map);
	}
	
	//근무 삭제 요청 리스트
	public void reqDeleteWork(Map<String, String> map) {
		// TODO Auto-generated method stub
		dao.reqDeleteWork(map);
	}
	
	//근무 추가 요청 
	public void reqCreateWork(Map<String, String> map) {
		// TODO Auto-generated method stub
		dao.reqCreateWork(map);
	}

	//근무 변경요청 리스트 
	public List getscheduleChange(String user_code_emp) {
		// TODO Auto-generated method stub
		
		List list = dao.getscheduleChange(user_code_emp);
		return list;
	}
	
	//근무 추가 삭제 요청 리스트 
	public List getReqList(String user_code_emp,String user_kind) {
		// TODO Auto-generated method stub
		return dao.getReqList(user_code_emp,user_kind);
	}

	public List getDaySchedule(String work_date, String store_code) {
		// TODO Auto-generated method stub
		return dao.getDaySchedule(work_date,store_code);
	}
	
	//알바생이 요청한 근무일자에 대한 승인 여부 업데이트
	public int updateAcceptScheduleChange(Map<String, String> map) {
		// TODO Auto-generated method stub
		try {
			dao.updateAcceptScheduleChange(map);
			return 0;
		} catch (Exception e) {
			// TODO: handle exception
//			dao.deleteRequestChange(map);
			dao.deniedRequest(map);
			//트리거에서 시간 중복이 발생할 시 
			return 1;
		}
		
	}

	//요청 근무 삭제 
	public void deleteRequestChange(Map<String, String> map) {
		// TODO Auto-generated method stub
		dao.deleteRequestChange(map);
	}

	public void reqUpdateWork(Map<String, String> map) {
		// TODO Auto-generated method stub
		dao.reqUpdateWork(map);
	}

	//직원 삭제
	public void deletePtj(String ptj_code,String user_code_ptj) {
		// TODO Auto-generated method stub
		dao.deletePtj(ptj_code,user_code_ptj);
	}

	//요청중인스케줄인지 확인 
	public int checkSchedule(String schedule_code) {
		// TODO Auto-generated method stub
		
		return dao.checkSchedule(schedule_code);
	}

	//매장 삭제
	public void deleteStore(String store_code , String user_code_emp) {
		// TODO Auto-generated method stub
		dao.deleteStore(store_code,user_code_emp);
	}

	
	
}
