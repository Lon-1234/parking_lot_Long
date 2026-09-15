package com.lon.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 停车场表
 * </p>
 *
 * @author Long
 * @since 2026-09-13
 */
@Getter
@Setter
@TableName("parking_lot")
public class ParkingLot implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 停车场主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 停车场名称
     */
    private String lotName;

    /**
     * 停车场编码
     */
    private String lotCode;

    /**
     * 地址
     */
    private String address;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 营业开始时间
     */
    private LocalTime businessStartTime;

    /**
     * 营业结束时间
     */
    private LocalTime businessEndTime;

    /**
     * 说明
     */
    private String description;

    /**
     * 总车位数
     */
    private Integer totalSpaces;

    /**
     * 空闲车位数
     */
    private Integer availableSpaces;

    /**
     * 状态：0停用，1营业中，2维护中
     */
    private Byte status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
