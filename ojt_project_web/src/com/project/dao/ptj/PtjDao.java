package com.project.dao.ptj;

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
public class PtjDao {

	@Autowired
	private SqlSession sqlsession;
	
	//전체 근무 스케줄 조회
	public List workList(String user_code_ptj) {
		// TODO Auto-generated method stub
		Map<String,String> param = new HashMap<String, String>();
		param.put("user_code_ptj", user_code_ptj);
		List returnList = sqlsession.selectList("ptj.workList",param);
		return returnList;
	}
	
	//하루 근무 스케줄
	public List dailyworkList(String user_code_ptj,String workDate) {
		
		Map<String,String> param = new HashMap<String, String>();
		param.put("user_code_ptj", user_code_ptj);
		param.put("WORK_DATE",workDate);
		return sqlsession.selectList("ptj.dailySchedule",param);
	}

	//근무지 리스트 조회
	public List workPlaceList(int user_number_ptj) {
		// TODO Auto-generated method stub
		Map<String, Integer> param = new HashedMap();
		param.put("user_code_ptj", user_number_ptj);
		
		return sqlsession.selectList("ptj.workPlace", param);
	}

	// 매장 연결 요청
	public int linkRequest(ParameterGroup param) {
		// TODO Auto-generated method stub
		Map<String , Object> data = new HashedMap();
		data.put("user_code_ptj", param.getValue("user_code_ptj"));
		data.put("store_code", param.getValue("store_code"));
		data.put("gender", param.getValue("gender"));
		data.put("link_stat", 'N');
		data.put("call", param.getValue("call"));
		return sqlsession.insert("ptj.linkRequest", data);
	}
	
	
	//요청받은 스케줄 리스트
	public List getScheduleChange(String user_code_ptj) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashMap<String, String>();
		
		data.put("USER_CODE_PTJ", user_code_ptj);
		
		return sqlsession.selectList("cmn.scheduleChangeList",data);
	}

	//요청한 스케줄 리스트
	public List getRequestSchedule(String user_code_ptj, String user_kind) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashMap<String, String>();
		
		data.put("USER_CODE_PTJ2", user_code_ptj);
		data.put("USER_KIND", user_kind);
		return sqlsession.selectList("cmn.scheduleChangeList",data);
	}
	
	//선택한 날짜의 스케줄 정보
	public List getDaySchedule(String work_date, String user_code_ptj) {
		// TODO Auto-generated method stub
		Map<String, String> data = new HashMap<String, String>();
		data.put("WORK_DATE", work_date);
		data.put("USER_CODE_PTJ", user_code_ptj);
		return sqlsession.selectList("cmn.storedaySchedule",data);
	}

	// 요청 근무 삭제
	public void deleteRequestChange(Map<String, String> map) {
		// TODO Auto-generated method stub
		sqlsession.delete("cmn.deleteReqScheduleChage",map);
		
	}
	//신규 스케줄 등록
	public void addNewScheduleReq(ParameterGroup param) {
		Map<String , Object> data = new HashedMap();
		data.put("STORE_CODE", param.getValue("store_code"));
		data.put("STORE_NAME", param.getValue("store_name"));
		data.put("USER_CODE_PTJ", param.getValue("user_code_ptj"));
		data.put("PTJ_NAME", param.getValue("ptj_name"));
		data.put("WORK_DATE", param.getValue("work_date"));
		data.put("WORK_BEGIN_TIME", param.getValue("work_date")+param.getValue("work_begin_time")+"00");
		data.put("WORK_END_DATE", param.getValue("work_end_date"));
		data.put("WORK_END_TIME", param.getValue("work_end_date")+param.getValue("work_end_time")+"00");
		data.put("BREAKTIME", param.getValue("breaktime"));
		data.put("DC", 'C');
		
		sqlsession.insert("ptj.reqScheduleWork",data);
	}
	//스케줄 변경 요청
	public void updateScheduleReq(ParameterGroup param) {
		Map<String , Object> data = new HashedMap();
		data.put("STORE_CODE", param.getValue("store_code"));
		data.put("STORE_NAME", param.getValue("store_name"));
		data.put("USER_CODE_PTJ", param.getValue("user_code_ptj"));
		data.put("PTJ_NAME", param.getValue("ptj_name"));
		data.put("WORK_DATE", param.getValue("work_date"));
		data.put("WORK_BEGIN_TIME", param.getValue("work_date")+param.getValue("work_begin_time")+"00");
		data.put("WORK_END_TIME", param.getValue("work_date")+param.getValue("work_end_time")+"00");
		data.put("BREAKTIME", param.getValue("breaktime"));
		data.put("DC", 'U');
		data.put("SCHEDULE_CODE",  param.getValue("schedule_code"));
		data.put("COLOR", "#FF9F45");
		sqlsession.update("ptj.reqScheduleWork", data);
	}
	
	//스케줄 삭제 요청
	public void deleteScheduleReq(ParameterGroup param) {
		Map<String , Object> data = new HashedMap();
		data.put("STORE_CODE", param.getValue("store_code"));
		data.put("STORE_NAME", param.getValue("store_name"));
		data.put("USER_CODE_PTJ", param.getValue("user_code_ptj"));
		data.put("PTJ_NAME", param.getValue("ptj_name"));
		data.put("WORK_DATE", param.getValue("work_date"));
		data.put("WORK_BEGIN_TIME", param.getValue("work_date")+param.getValue("work_begin_time")+"00");
		data.put("WORK_END_TIME", param.getValue("work_date")+param.getValue("work_end_time")+"00");
		data.put("BREAKTIME", param.getValue("breaktime"));
		data.put("DC", 'D');
		data.put("SCHEDULE_CODE",  param.getValue("schedule_code"));
		data.put("COLOR", "#FC4F4F");
		sqlsession.update("ptj.reqScheduleWork", data);
	}
	
	//변경 요청 테이블 조회
	public List dailyScheduleReq(String user_code_ptj, String format_date) {
		Map<String, String> data = new HashMap<String, String>();
		data.put("WORK_DATE", format_date);
		data.put("USER_CODE_PTJ", user_code_ptj);
		List result = sqlsession.selectList("ptj.dailyScheduleReq",data);
		System.out.println(result);
		return result;
	}
	
	
	// 근무지 삭제
	public void deleteStore(String store_code, String user_code_ptj) {
		// TODO Auto-generated method stub
		Map<String, String > data = new HashedMap();
		data.put("USER_CODE_PTJ", user_code_ptj);
		data.put("STORE_CODE", store_code);
		// 근무지 삭제 
		sqlsession.delete("ptj.deleteWorkplace", data);
		//직원 목록 삭제
		sqlsession.delete("ptj.deletePartTimer",data);
		//스케줄 삭제
//		sqlsession.delete("ptj.deleteSchedulePtj",data);
		
	}
	
	// 요청 목록 거절 및 승락
	public void saveAcceptSchedule(Map<String, String> map) {
		// TODO Auto-generated method stub
		if(map.get("ACCEPT_PTJ").equals("D")) { // 요청을 거절 할 경우
			sqlsession.update("ptj.deniedRequest", map);
		}else if(map.get("ACCEPT_PTJ").equals("Y")) { // 요청 승인 일 경우

			//스케줄에 업데이트 
			if(map.get("DC").equals("C")) {
				System.out.println("추가");
				sqlsession.insert("cmn.insertSchedule",map);
			}else if(map.get("DC").equals("D")) {
				System.out.println("삭제");
				sqlsession.delete("cmn.deletSchedule", map);
			}else if(map.get("DC").equals("U")) {
				System.out.println("변경");
				sqlsession.update("cmn.updateSchedule",map);
			}
			// 요청 목록에서 삭제 
			sqlsession.delete("cmn.deleteReqScheduleChage",map);
		}
	}
	
	
}
