package com.project.dao.emp;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.map.HashedMap;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.cleopatra.protocol.data.ParameterGroup;

@Repository
@Transactional(rollbackFor = Exception.class)
public class EmployerDao {
	
	private final SqlSession sqlsession;
	
	@Autowired
	public EmployerDao(SqlSession sqlsession) {
		this.sqlsession = sqlsession;
	}
	
	//매장 스케줄 가져오기
	public List storeScheduleList(String user_id) {
		Map<String, String> param = new HashedMap();
		param.put("USER_CODE_EMP", user_id);
		return sqlsession.selectList("emp.storeSchedule", param);
	}
	
	//매장 리스트 가져오기
	public List storeList(String user_umber_emp,  String user_email, String user_code_ptj) {
		Map<String,String> param = new HashedMap();
		param.put("USER_NUMBER_EMP", user_umber_emp);
		param.put("USER_EMAIL", user_email);
		param.put("user_code_ptj", user_code_ptj);
		
		return sqlsession.selectList("emp.storeList", param);
	}

	//매장 추가
	public int addStore(ParameterGroup param) {
		Map<String, Object> storeData = new HashMap();
		storeData.put("USER_NUMBER_EMP", param.getValue("USER_NUMBER_EMP"));
		storeData.put("business_type_large", param.getValue("business_type_large"));
		storeData.put("business_type_small", param.getValue("business_type_small"));
		storeData.put("store_name", param.getValue("store_name"));
		storeData.put("USER_EMAIL", param.getValue("USER_EMAIL"));
		
		return sqlsession.insert("emp.addStore", storeData);
	}
	
	//전체 직원 목록
	public List<Map<String, Object>> getPtjList(String sessionUserNumber) {
		List<Map<String, Object>> result = sqlsession.selectList("emp.ptjList", sessionUserNumber);
		return result;
	}

	public List<Map<String, Object>> getschedule(ParameterGroup param) {
		Map<String, Object> scheduleData = new HashMap();
		scheduleData.put("DT_BEGIN", param.getValue("DT_BEGIN"));
		scheduleData.put("DT_END", param.getValue("DT_END"));
		scheduleData.put("USER_NUMBER", param.getValue("USER_NUMBER"));
		scheduleData.put("STORE_CODE", param.getValue("STORE_CODE"));
		
		List<Map<String, Object>> result = sqlsession.selectList("emp.getschedule",scheduleData);
		return result;
	}

	public List<Map<String, Object>> getRequestList(String USER_NUMBER) {
		List<Map<String, Object>> result = sqlsession.selectList("emp.linkReqList", USER_NUMBER);
//		System.out.println(result);
		// TODO Auto-generated method stub
		return result;
	}

	
	//매장 연결 요청 승인 
	public int updatePtLinkjRequest(Map<String, String> map) {
		// TODO Auto-generated method stub
		//승인 여부가 Y 일경우
		//workplace 테이블에 값 생성 
		if(map.get("LINK_STAT").equals("Y")) {			
			sqlsession.insert("ptj.insertWorkPlace",map);
		}
		//승인 여부가 D일 경우
		if(map.get("LINK_STAT").equals("D")) {
			sqlsession.delete("emp.deleteLinkRequest",map);
		}
		//요청 값 삭제 
		
		return sqlsession.update("emp.ptjLinkRequest",map);
	}

	//고용주 근무 삭제 요청
	public void reqDeleteWork(Map<String, String> map) {
		// 삭제 요청 중복 방지
		int success = sqlsession.selectOne("emp.shcedule_exists", map);
		if(success !=1 ) {
			map.put("WORK_BEGIN_TIME",map.get("WORK_DATE")+map.get("WORK_BEGIN_TIME")+"00");
			
			map.put("WORK_END_TIME",map.get("WORK_DATE")+map.get("WORK_END_TIME")+"00");
			map.put("DC", "D");
			map.put("COLOR", "#FC4F4F");
			System.out.println("DELETE");
			System.out.println(map.toString());
			// TODO Auto-generated method stub
			sqlsession.insert("emp.reqScheduleWork", map);
		}
	}
	
	//고용주 근무 추가 요청
	public void reqCreateWork(Map<String, String> map) {
		map.put("WORK_BEGIN_TIME",map.get("WORK_DATE")+map.get("WORK_BEGIN_TIME")+"00");
		map.put("WORK_END_TIME",map.get("WORK_DATE")+map.get("WORK_END_TIME")+"00");
		map.put("DC","C");
		System.out.println("CREATE");
		System.out.println(map.toString());
		
		sqlsession.insert("emp.reqScheduleWork",map);
	}
	
	//고용주 근무 변경 요청
	public void reqUpdateWork(Map<String, String> map) {
		map.put("WORK_BEGIN_TIME",map.get("WORK_DATE")+map.get("WORK_BEGIN_TIME")+"00");
		map.put("WORK_END_TIME",map.get("WORK_DATE")+map.get("WORK_END_TIME")+"00");
		map.put("DC","U");
		map.put("COLOR", "#FF9F45");
		System.out.println("UPDATE");
		System.out.println(map.toString());
		sqlsession.insert("emp.reqScheduleWork",map);
	}
	
	//
	public List getscheduleChange(String user_code_emp) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashedMap();
		data.put("USER_CODE_EMP", user_code_emp);
		return sqlsession.selectList("cmn.scheduleChangeList",data);
	}
	
	//고용추가 요청한 근무 추가 삭제 요청 리스트
	public List getReqList(String user_code_emp, String user_kind) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashedMap();
		data.put("USER_CODE_EMP2", user_code_emp);
		data.put("USER_KIND", user_kind);
		System.out.println(data.toString());
		return sqlsession.selectList("cmn.scheduleChangeList",data);
	}

	
	//고용주가 선택한 요청 근무 일자에 해당하는 근무일자
	public List getDaySchedule(String work_date, String store_code) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashedMap();
		data.put("WORK_DATE",work_date);
		data.put("STORE_CODE",store_code);
		return sqlsession.selectList("cmn.storedaySchedule",data);
	}

	
	//요청 근무 수락 
	public int updateAcceptScheduleChange(Map<String, String> map){
		// TODO Auto-generated method stub
		try {
			//고용주가 승낙한 요청이라면 
			if(map.get("ACCEPT_EMP").equals("Y")) {
				//근무 추가일경우
				System.out.println(map.get("UD_SCHEDULE_NUMBER"));
				if(map.get("DC").equals("C")) { 
					//schedule 테이블에 추가
					sqlsession.insert("cmn.insertSchedule", map);
					
				// 근무 삭제일경우
				}else if(map.get("DC").equals("D")){
					//삭제
					System.out.println("삭제");
					sqlsession.delete("cmn.deletSchedule", map);
					
				}else {
					//변경
					System.out.println("변경");
					sqlsession.update("cmn.updateSchedule",map);
				}
				//request 테이블에서 삭제
				sqlsession.delete("cmn.deleteReqScheduleChage",map);
			//승낙하지 않은 요청
			}else { 
				sqlsession.update("emp.deniedRequest", map);
			}
			return 0;
		} catch (Exception e) {
			deniedRequest(map); //시간중복 발생시 해당 요청 근무 거절 
			return 1;
		}
		
		
	}


	public void deleteRequestChange(Map<String, String> map) {
		// TODO Auto-generated method stub
		sqlsession.delete("emp.deleteReqScheduleChage",map);
	}
	
	//알바생 퇴사 
	public void deletePtj(String ptj_code,String user_code_ptj) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashedMap();
		data.put("PTJ_CODE",ptj_code);
		data.put("USER_CODE_PTJ", user_code_ptj);
//		sqlsession.update("emp.deletePtj",data);
		//part_timer 삭제 
		sqlsession.delete("emp.deletePartTimer",data);
		//workplace 삭제 
		sqlsession.delete("emp.deleteworkplace",data);
		
	}

	public int checkSchedule(String schedule_code) {
		// TODO Auto-generated method stub
		int result = 0;
//		Map<String, String> data = new HashedMap();
//		data.put("schedule_code",schedule_code);
		Map data = sqlsession.selectOne("emp.checkRequestSchedule",schedule_code);
		if(data == null) {//존재하지 않으면 변경 요청 가능 0
			return result;
		}else {
			return 1;
		}
	}

	public void deleteStore(String store_code, String user_code_emp) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashedMap();
		data.put("STORE_CODE",store_code);
		data.put("USER_NUMBER_EMP", user_code_emp);
		
		sqlsession.delete("emp.deleteStore",data);
	}
	
	
	//요청 근무 거절 
	public void deniedRequest(Map<String, String> map) {
		// TODO Auto-generated method stub
		sqlsession.update("emp.deniedRequest", map);
	}

	

	
}
