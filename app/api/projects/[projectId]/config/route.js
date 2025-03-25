import { NextResponse } from 'next/server';
import { NextAPI } from '@/service/middleware/entry';
import { MongoProject } from '@dataset/service/core/projects/schema'

// 获取项目配置
export async function GET(request, { params }) {
  return NextAPI(handler)(request, params)
}

async function handler(_, params) {
  try {
    const projectId = params.projectId;
    const taskConfig = await MongoProject.findOne({ projectId });
    return taskConfig;
  } catch (error) {
    console.error('获取项目配置失败:', error);
    throw { error: error.message, status: 500  };
  }
}

// 更新项目配置
export async function PUT(request, { params }) {
  return NextAPI(handlerPUT)(request, params)
}

async function handlerPUT(request, params) {
  try {
    const projectId = params.projectId;
    const newConfig = await request.json();

    const updatedConfig = {
      ...newConfig.prompts
    };

    const existingTask = await MongoProject.findOne({ projectId });

    if(existingTask){
      const config = await MongoProject.findOneAndUpdate(
        { projectId },
        {
          $set: updatedConfig
        },
        { new: true } // 返回更新后的文档
      );
      return config
    }else{
      throw { error: '配置不存在', status: 500  };
      // const newTask = new MongoProject({
      //   "projectId": "1742804524701",
      //   "name": "医学数据集",
      //   "description": "",
      //   "reuseConfigFrom": "",
      //   "uploadedFiles": [
      //     "北京协和医院内科大查房3_22_30.md"
      //   ],
      //   "globalPrompt": "",
      //   "questionPrompt": "",
      //   "answerPrompt": "从症状和治疗方案两个方向进行回答 不明确的就为空",
      //   "labelPrompt": "",
      //   "domainTreePrompt": "一级疾病 二级 科室",
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // });
      // const savedTask = await newTask.save();
    }
  } catch (error) {
    console.error('更新项目配置失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}