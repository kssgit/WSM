package com.test.dao;

import java.util.List;
import java.util.Map;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class UserDao {
	private Logger logger = LogManager.getLogger(UserDao.class);
	
	@Autowired
	private SqlSessionTemplate sqlsession;
	
	public List getUserListOnLoad() {
		
		return this.sqlsession.selectList("user.onloadUserlist");
	}
	
	public List getSearchEmailList(Map<String , Object> param) {
		
		return this.sqlsession.selectList("user.searchEmail",param);
	}
	
	public int updateUser(Map param) {
		return this.sqlsession.update("user.updateUser",param);
	}
	
	public int insertUser(Map param) {
		return this.sqlsession.insert("user.insertUser",param);
	}
	
	public int deleteUser(Map param) {
		return this.sqlsession.delete("user.deleteUser",param);
	}
}
